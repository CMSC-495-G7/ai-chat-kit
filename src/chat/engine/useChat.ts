import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Responder } from './chatEngine'
import type {
  AskedOverScope,
  ChainControls,
  ChainState,
  Message,
  QueueMove,
  QueuedMessage,
  ToolCall,
  TurnFault,
  TurnStep,
  TurnTrace,
} from './types'

// Ids are unique across the whole session; they only ever move forward.
let nextId = 1

/** Insert or update a tool call in place, matched by toolCallId. Later
 *  events omit fields sent earlier (completed has no input), so missing
 *  fields keep their previous values. */
function upsertTool(tools: ToolCall[] | undefined, call: ToolCall): ToolCall[] {
  const list = tools ?? []
  const at = list.findIndex((t) => t.toolCallId === call.toolCallId)
  if (at === -1) return [...list, call]
  return list.map((t, i) =>
    i === at
      ? {
          ...t,
          status: call.status,
          input: call.input ?? t.input,
          output: call.output ?? t.output,
          error: call.error ?? t.error,
        }
      : t,
  )
}

// --- Turn trace -------------------------------------------------------------
// Pure updates over a turn's trace, in the same spirit as upsertTool above.
// Every step's `at` and `ms` are relative to the trace's startedAt, so the
// whole timeline stays valid no matter when it's rendered.

/** Start a timed step. No-op if one with this id is already open, so a repeated
 *  delta (every `thinking` chunk, say) only opens its phase once. */
function openStep(trace: TurnTrace, step: Omit<TurnStep, 'at' | 'ms'>, now: number): TurnTrace {
  if (trace.steps.some((s) => s.id === step.id)) return trace
  return { ...trace, steps: [...trace.steps, { ...step, at: now - trace.startedAt }] }
}

/** Stop the clock on an open step. Already-closed steps keep their duration. */
function closeStep(trace: TurnTrace, id: string, now: number): TurnTrace {
  return {
    ...trace,
    steps: trace.steps.map((s) =>
      s.id === id && s.ms === undefined && s.at !== undefined
        ? { ...s, ms: now - trace.startedAt - s.at }
        : s,
    ),
  }
}

/** Record a fault the turn survived. Never downgrades a turn that already
 *  failed — a fatal error is the more specific outcome. `now` is omitted for a
 *  fault the responder only reported at the end, which leaves `at` unset so the
 *  panel can render it without a timestamp instead of inventing one. */
function addFault(trace: TurnTrace, fault: TurnFault, now?: number): TurnTrace {
  return {
    ...trace,
    status: trace.status === 'failed' ? 'failed' : 'recovered',
    steps: [
      ...trace.steps,
      {
        id: `fault-${trace.steps.length}`,
        label: 'Interrupted',
        kind: 'fault',
        ...(now === undefined ? {} : { at: now - trace.startedAt, ms: 0 }),
        fault,
      },
    ],
  }
}

/** Merge the faults a responder reports on `done` into a trace that may already
 *  hold streamed ones. A fault carrying a `code` already seen is dropped: the
 *  streamed copy is the same problem and knows when it happened. */
function mergeReportedFaults(trace: TurnTrace, faults: TurnFault[]): TurnTrace {
  const seen = new Set(
    trace.steps
      .filter((s) => s.kind === 'fault')
      .map((s) => s.fault?.code)
      .filter(Boolean),
  )
  return faults.reduce((acc, fault) => {
    if (fault.code && seen.has(fault.code)) return acc
    if (fault.code) seen.add(fault.code)
    return addFault(acc, fault)
  }, trace)
}

/** Mark a turn the reader ended themselves. Stopping is not a fault, but the
 *  trace still must not claim the turn was answered — a stopped message says
 *  "Stopped" right above the panel. A turn that already failed keeps that. */
function asStopped(trace: TurnTrace): TurnTrace {
  return trace.status === 'failed' ? trace : { ...trace, status: 'stopped' }
}

/** Close the trace and every step still open. Idempotent: a turn that ends
 *  fatally and then unwinds through the loop's tail can call this twice. */
function endTrace(trace: TurnTrace, now: number): TurnTrace {
  const total = trace.ms ?? now - trace.startedAt
  return {
    ...trace,
    ms: total,
    // An untimed step (`at` unset) has nothing to close — leave it alone.
    steps: trace.steps.map((s) =>
      s.ms === undefined && s.at !== undefined ? { ...s, ms: total - s.at } : s,
    ),
  }
}

/** Lift a trace update into a Message patch, skipping messages that have none. */
function traced(m: Message, fn: (t: TurnTrace) => TurnTrace): Partial<Message> {
  return m.trace ? { trace: fn(m.trace) } : {}
}

/**
 * Drives a conversation from any Responder: appends the user turn, streams the
 * assistant reply (thinking, tool calls, then content), and tracks the busy
 * state.
 *
 * Sends funnel through a FIFO queue drained by a single pump, so a message
 * written mid-stream waits its turn instead of being dropped. The queue is
 * returned separately from `messages` and is the queue dock's to render.
 *
 * The invariant that keeps the thread still: **a message is appended to
 * `messages` once, when its turn actually starts, and never moves within the
 * transcript again.** Queued text lives only in `queue` until then, so a
 * growing answer can't shove it down the page and two queued turns can't swap
 * places as the first dispatches.
 *
 * `stop` aborts the run and holds the queue — visibly, so nothing sits there
 * silently waiting. `sendNow` aborts the run and jumps a message to the front.
 * An interrupted assistant message keeps its partial content, flagged
 * `stopped: true`.
 */
export type UseChatOptions = {
  /**
   * Records what the next turn is being asked over.
   *
   * Called at DISPATCH, not when the message is queued. A question that waited
   * behind three others is answered under whatever scope is in force when it
   * actually runs, and that is the scope the transcript has to show — the
   * record exists to say what the answer was computed over, not what the
   * person was looking at while they typed.
   *
   * Omit it and nothing is recorded, which is every host without filters.
   */
  captureScope?: () => AskedOverScope | undefined
}

export function useChat(responder: Responder, { captureScope }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [queue, setQueue] = useState<QueuedMessage[]>([])
  const [held, setHeld] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  // Source of truth for the drain loop — the async pump can't read fresh React
  // state mid-flight, so every queue mutation goes through `writeQueue`.
  const queueRef = useRef<QueuedMessage[]>([])
  // Synchronous re-entrancy guard: only one pump drains at a time.
  const busyRef = useRef(false)
  // Set by stop()/hold(): the queue waits until the reader resumes it.
  const heldRef = useRef(false)
  // Read through a ref so a host that rebuilds the callback every render does
  // not invalidate runTurn and, with it, the whole pump.
  const captureRef = useRef(captureScope)
  captureRef.current = captureScope
  // A chain the reader is building (queue held until they run it) or running
  // (progress counted against `total`). Mirrored in a ref for the same reason
  // as the queue: callbacks below read it without re-binding every render.
  const [chain, setChainState] = useState<ChainState | null>(null)
  const chainRef = useRef<ChainState | null>(null)
  const setChain = useCallback((next: ChainState | null) => {
    chainRef.current = next
    setChainState(next)
  }, [])

  /** Single writer for both copies of the queue — the ref the pump reads and
   *  the state the dock renders. They cannot be allowed to drift. */
  const writeQueue = useCallback((next: QueuedMessage[]) => {
    queueRef.current = next
    setQueue(next)
  }, [])

  const patch = useCallback((id: number, apply: (m: Message) => Partial<Message>) => {
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...apply(m) } : m)))
  }, [])

  /** Run one full turn: dispatch the queued user bubble, stream the reply. */
  const runTurn = useCallback(
    async (text: string, userId: number) => {
      const controller = new AbortController()
      abortRef.current = controller
      const { signal } = controller

      const assistantId = nextId++
      const startedAt = Date.now()
      // The user turn joins the transcript HERE, at the moment it starts — not
      // when it was written. That is the whole reason the thread never jumps:
      // there is nothing queued in `messages` to re-order or push around.
      setMessages((ms) => [
        ...ms,
        { id: userId, role: 'user', content: text, askedOver: captureRef.current?.() },
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          thinking: '',
          thinkingActive: true,
          trace: { status: 'ok', startedAt, steps: [] },
        },
      ])

      const thinkingStart = startedAt
      try {
        for await (const event of responder(text, signal)) {
          if (signal.aborted) break
          const now = Date.now()
          switch (event.type) {
            case 'thinking':
              // Deltas carry their own whitespace; concatenate verbatim.
              // Reactivates the shimmer when thinking resumes after a tool call.
              patch(assistantId, (m) => ({
                thinking: (m.thinking ?? '') + event.delta,
                thinkingActive: true,
                ...traced(m, (t) =>
                  openStep(t, { id: 'thinking', label: 'Reasoning', kind: 'thinking' }, now),
                ),
              }))
              break
            case 'thinking-done':
              patch(assistantId, (m) => ({
                thinking: event.fullText ?? m.thinking,
                thinkingActive: false,
                thinkingSec: Math.max(2, Math.round((Date.now() - thinkingStart) / 1000)),
                streaming: true,
                ...traced(m, (t) => closeStep(t, 'thinking', now)),
              }))
              break
            case 'content':
              patch(assistantId, (m) => ({
                content: m.content + event.delta,
                // A response with no thinking phase jumps straight to streaming.
                thinkingActive: false,
                streaming: true,
                ...traced(m, (t) =>
                  openStep(t, { id: 'content', label: 'Answering', kind: 'content' }, now),
                ),
              }))
              break
            case 'done':
              patch(assistantId, (m) => ({
                content: event.fullText ?? m.content,
                streaming: false,
                thinkingActive: false,
                ...traced(m, (t) => {
                  const withMeta = { ...t, model: event.model, tokens: event.tokens }
                  // Reported faults land before the trace closes, so they're
                  // included in the status but never get a fabricated timestamp.
                  const merged = event.errors?.length
                    ? mergeReportedFaults(withMeta, event.errors)
                    : withMeta
                  return endTrace(merged, now)
                }),
              }))
              break
            case 'tool':
              patch(assistantId, (m) => ({
                tools: upsertTool(m.tools, event.toolCall),
                // Tool activity means reasoning display is no longer "the" spinner.
                thinkingActive: false,
                ...traced(m, (t) => {
                  const { toolCallId, name, status } = event.toolCall
                  if (status === 'started')
                    return openStep(t, { id: toolCallId, label: name, kind: 'tool' }, now)
                  const closed = closeStep(t, toolCallId, now)
                  // A failed tool the model worked around still leaves the turn
                  // answerable — the chip carries the failure on its own.
                  return status === 'failed' && closed.status === 'ok'
                    ? { ...closed, status: 'recovered' }
                    : closed
                }),
              }))
              break
            case 'sources':
              // Sources (and their highlights) arrive once, whole — no merging.
              patch(assistantId, () => ({
                sources: event.sources,
                highlights: event.highlights,
              }))
              break
            case 'followups':
              patch(assistantId, () => ({ followups: event.items }))
              break
            case 'error':
              // A recoverable error is a fact about the stream, not a problem
              // the reader has to act on: the answer is still coming. It lands
              // on the trace and leaves `streaming` alone so content resumes.
              if (event.recoverable) {
                patch(assistantId, (m) => traced(m, (t) => addFault(t, event.fault, now)))
                break
              }
              patch(assistantId, (m) => ({
                error: event.fault,
                streaming: false,
                thinkingActive: false,
                ...traced(m, (t) => endTrace({ ...t, status: 'failed' }, now)),
              }))
              break
          }
        }
        // An aborted turn keeps its partial content, marked as stopped.
        patch(assistantId, (m) => ({
          streaming: false,
          thinkingActive: false,
          ...(signal.aborted ? { stopped: true } : {}),
          ...traced(m, (t) => endTrace(signal.aborted ? asStopped(t) : t, Date.now())),
        }))
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          patch(assistantId, (m) => ({
            streaming: false,
            thinkingActive: false,
            stopped: true,
            ...traced(m, (t) => endTrace(asStopped(t), Date.now())),
          }))
        } else {
          // Surface unexpected responder failures in the conversation instead
          // of letting them escape as an unhandled rejection.
          patch(assistantId, (m) => ({
            error: {
              message: err instanceof Error ? err.message : String(err),
              code: 'RESPONDER_THREW',
              source: 'responder',
            },
            streaming: false,
            thinkingActive: false,
            ...traced(m, (t) => endTrace({ ...t, status: 'failed' }, Date.now())),
          }))
        }
      } finally {
        // Only the most recent turn owns the controller slot.
        if (abortRef.current === controller) abortRef.current = null
      }
    },
    [responder, patch],
  )

  /** Single consumer: drains the queue in FIFO order until empty or held. */
  const pump = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    try {
      while (queueRef.current.length > 0 && !heldRef.current) {
        const [next, ...rest] = queueRef.current
        writeQueue(rest)
        await runTurn(next.text, next.id)
      }
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [runTurn, writeQueue])

  /** Queue a message behind whatever is running. With nothing running and no
   *  hold in place it dispatches immediately, which is the idle case. */
  const send = useCallback(
    (text: string) => {
      const body = text.trim()
      if (!body) return
      writeQueue([...queueRef.current, { id: nextId++, text: body }])
      // Anything added while a chain runs joins the end of it, so the count
      // has to grow with it or the progress would read "4 of 3".
      const c = chainRef.current
      if (c?.phase === 'running') setChain({ ...c, total: c.total + 1 })
      void pump()
    },
    [pump, setChain, writeQueue],
  )

  /** Running any one step of a chain being built runs the rest behind it —
   *  the hold is gone — so it becomes a running chain rather than leaving the
   *  dock claiming nothing will send. */
  const leavePlanning = useCallback(() => {
    if (chainRef.current?.phase !== 'planning') return
    setChain({ phase: 'running', total: queueRef.current.length })
  }, [setChain])

  /**
   * Interrupt the running turn and answer this message next. The rest of the
   * queue keeps its order behind it, and a hold is released: asking for
   * something *now* is as explicit as an intent gets.
   */
  const sendNow = useCallback(
    (text: string) => {
      const body = text.trim()
      if (!body) return
      heldRef.current = false
      setHeld(false)
      writeQueue([{ id: nextId++, text: body }, ...queueRef.current])
      leavePlanning()
      // A running pump picks this up as soon as the aborted turn unwinds; the
      // trailing pump() call covers the idle case and no-ops otherwise.
      abortRef.current?.abort()
      void pump()
    },
    [leavePlanning, pump, writeQueue],
  )

  /** Stop the running turn and hold the queue. Both halves are deliberate: a
   *  reader who stops an answer to think is not asking for the next queued
   *  message to start writing. The dock says so, and offers Resume. */
  const stop = useCallback(() => {
    heldRef.current = true
    setHeld(true)
    abortRef.current?.abort()
  }, [])

  /** Hold the queue without touching the answer in progress. */
  const hold = useCallback(() => {
    heldRef.current = true
    setHeld(true)
  }, [])

  const resume = useCallback(() => {
    heldRef.current = false
    setHeld(false)
    leavePlanning()
    void pump()
  }, [leavePlanning, pump])

  /**
   * Start building a chain: questions that run one after another, in order,
   * each answered in this conversation so later steps can build on earlier
   * answers.
   *
   * Building is a hold with a different face. Everything the reader adds
   * waits in the queue — the pump already respects a hold — until they run it.
   * Whatever was queued already becomes the chain's first steps.
   */
  const startChain = useCallback(() => {
    if (chainRef.current?.phase === 'planning') return
    heldRef.current = true
    setHeld(true)
    setChain({ phase: 'planning' })
  }, [setChain])

  /** Add a step to the chain being built, starting one if there is none. */
  const addToChain = useCallback(
    (text: string) => {
      const body = text.trim()
      if (!body) return
      startChain()
      writeQueue([...queueRef.current, { id: nextId++, text: body }])
    },
    [startChain, writeQueue],
  )

  /** Run the chain as built. Nothing to run leaves it open. */
  const runChain = useCallback(() => {
    if (chainRef.current?.phase !== 'planning' || queueRef.current.length === 0) return
    setChain({ phase: 'running', total: queueRef.current.length })
    heldRef.current = false
    setHeld(false)
    void pump()
  }, [pump, setChain])

  /** Stop building without running. Nothing is thrown away: steps already
   *  added stay in the queue, held, where Resume or Clear deal with them like
   *  any other held message. An empty chain simply releases the hold. */
  const cancelChain = useCallback(() => {
    if (chainRef.current?.phase !== 'planning') return
    setChain(null)
    if (queueRef.current.length === 0) {
      heldRef.current = false
      setHeld(false)
      void pump()
    }
  }, [pump, setChain])

  /**
   * Re-run the turn that produced an assistant message. Drops that answer and
   * the user turn that prompted it, then re-queues the prompt at the front:
   * the pair is appended again, in order, when the turn starts.
   */
  const retry = useCallback(
    (assistantId: number) => {
      const at = messages.findIndex((m) => m.id === assistantId)
      if (at === -1) return
      const user = messages.slice(0, at).findLast((m) => m.role === 'user')
      if (!user) return
      setMessages((ms) => ms.filter((m) => m.id !== assistantId && m.id !== user.id))
      heldRef.current = false
      setHeld(false)
      // Re-asking is not an interrupt: it takes its turn at the back, and shows
      // in the dock while it waits like anything else queued.
      writeQueue([...queueRef.current, { id: user.id, text: user.content }])
      void pump()
    },
    [messages, pump, writeQueue],
  )

  /** Rewrite a queued message. Empty text removes it — clearing the box and
   *  saving is how people delete things. */
  const editQueued = useCallback(
    (id: number, text: string) => {
      const body = text.trim()
      if (!body) {
        writeQueue(queueRef.current.filter((q) => q.id !== id))
        return
      }
      writeQueue(queueRef.current.map((q) => (q.id === id ? { ...q, text: body } : q)))
    },
    [writeQueue],
  )

  /** Move a queued message one place, to the front, or to an exact index
   *  (what a drop reports). A plain number is always an absolute position —
   *  relative steps are named, so the two can never be confused. */
  const moveQueued = useCallback(
    (id: number, to: QueueMove) => {
      const items = queueRef.current
      const at = items.findIndex((q) => q.id === id)
      if (at === -1) return
      const target =
        to === 'front' ? 0 : to === 'up' ? at - 1 : to === 'down' ? at + 1 : Math.trunc(to)
      if (target < 0 || target >= items.length || target === at) return
      const next = items.filter((q) => q.id !== id)
      next.splice(target, 0, items[at])
      writeQueue(next)
    },
    [writeQueue],
  )

  /** Promote a queued message and run it now, interrupting the current turn.
   *  Same path as `sendNow`, so there is one interrupt in the codebase. */
  const sendQueuedNow = useCallback(
    (id: number) => {
      const items = queueRef.current
      const at = items.findIndex((q) => q.id === id)
      if (at === -1) return
      heldRef.current = false
      setHeld(false)
      writeQueue([items[at], ...items.filter((q) => q.id !== id)])
      leavePlanning()
      abortRef.current?.abort()
      void pump()
    },
    [leavePlanning, pump, writeQueue],
  )

  /** Remove a message from the queue before it runs. */
  const removeQueued = useCallback(
    (id: number) => writeQueue(queueRef.current.filter((q) => q.id !== id)),
    [writeQueue],
  )

  /** Empty the queue. */
  const clearQueue = useCallback(() => writeQueue([]), [writeQueue])

  const reset = useCallback(() => {
    writeQueue([])
    setChain(null)
    heldRef.current = false
    setHeld(false)
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setBusy(false)
  }, [setChain, writeQueue])

  // A running chain is finished once nothing is left to run.
  useEffect(() => {
    if (chain?.phase === 'running' && !busy && queue.length === 0) setChain(null)
  }, [busy, chain, queue.length, setChain])

  useEffect(
    () => () => {
      queueRef.current = []
      abortRef.current?.abort()
    },
    [],
  )

  const chainControls = useMemo<ChainControls>(
    () => ({
      state: chain,
      start: startChain,
      add: addToChain,
      run: runChain,
      cancel: cancelChain,
    }),
    [chain, startChain, addToChain, runChain, cancelChain],
  )

  return {
    messages,
    busy,
    queue,
    held,
    /** The chain being built or run, and its controls. */
    chain: chainControls,
    send,
    sendNow,
    stop,
    hold,
    resume,
    retry,
    editQueued,
    moveQueued,
    sendQueuedNow,
    removeQueued,
    clearQueue,
    reset,
  }
}
