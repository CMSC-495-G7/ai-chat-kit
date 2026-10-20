// A chat server with no network behind it.
//
// The stories that use this run the real client — `createWsResponder`, the
// same one an app points at a server — against a socket that answers from a
// script. Everything past the socket is production code: the wire protocol is
// parsed, translated and rendered exactly as it would be live. What is
// simulated is the part a story cannot depend on: a server being up, and a
// connection being good or bad on cue.
//
// Deterministic on purpose. No random jitter and no real clock in the events,
// so a test can drive a story with `page.clock` and get the same run twice.
import { useEffect, useMemo, useRef } from 'react'
import type { Responder } from '../../engine/chatEngine'
import type { WSEvent, WSHighlight, WSSource, WSTurnError } from '../../engine/wsProtocol'
import { createWsResponder, type ChatSocket } from '../../engine/wsResponder'
import { createScenarioPicker, type Scenario } from '../../fixtures/wireScenarios'

export type NetworkCondition = 'healthy' | 'slow' | 'offline' | 'drops' | 'flaky'

type ConditionSpec = {
  label: string
  /** One line for a story to show its reader: what will happen, and what to try. */
  hint: string
  /** How long the handshake takes. */
  connectMs: number
  /** Multiplies every delay on the server's side. */
  pace: number
  /** Whether this connection attempt (counted from 1) is refused. */
  refuses?: (attempt: number) => boolean
  /** The server vanishes, without a word, after this many answer chunks. */
  dropAfterChunks?: number
}

export const NETWORK: Record<NetworkCondition, ConditionSpec> = {
  healthy: {
    label: 'Healthy',
    hint: 'A server that answers promptly. Try “market” for tool calls, “quote” for a tool that fails, “degraded” for an answer with reported problems, or “error” for a server that gives up.',
    connectMs: 120,
    pace: 1,
  },
  slow: {
    label: 'Slow connection',
    hint: 'Two and a half seconds to connect, then everything at a quarter speed. Ask anything, then try queueing a second question or stopping the first.',
    connectMs: 2500,
    pace: 4,
  },
  offline: {
    label: 'Server unreachable',
    hint: 'Every connection is refused. Ask anything to see the turn fail, and what Retry does when nothing has changed.',
    connectMs: 600,
    pace: 1,
    refuses: () => true,
  },
  flaky: {
    label: 'Fails, then connects',
    hint: 'Every other connection is refused. Ask anything: the first attempt fails and Retry gets through.',
    connectMs: 400,
    pace: 1,
    refuses: (attempt) => attempt % 2 === 1,
  },
  drops: {
    label: 'Connection drops',
    hint: 'The connection closes partway through each answer, with no error from the server. Ask anything to see what is left on screen.',
    connectMs: 120,
    pace: 1,
    dropAfterChunks: 12,
  },
}

/** The `network` control every simulated-network story offers. */
export const networkArgTypes = {
  network: {
    control: 'select',
    options: Object.keys(NETWORK),
    description:
      'The simulated connection. Changing it mid-conversation applies to the next question.',
  },
} as const

// The server's own pacing, in milliseconds, before a condition scales it.
const PACING = {
  beforeFirstEvent: 350,
  perThinkingChunk: 45,
  perTokenChunk: 40,
  betweenSteps: 400,
  defaultToolMs: 700,
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

/** Two words to a chunk, each keeping its trailing whitespace, so the chunks
 *  joined with '' are the text again. */
function chunkText(text: string): string[] {
  const words = text.split(/(?<=\s)/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += 2) chunks.push(words.slice(i, i + 2).join(''))
  return chunks
}

/**
 * Plays a scenario as the events a server would send. Resolves when it has
 * said everything, and stops quietly when the signal aborts — the client hung
 * up, so there is nobody to tell.
 */
async function runScenario(
  scenario: Scenario,
  streamId: string,
  pace: number,
  send: (event: WSEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const base = () => ({ streamId, timestamp: Date.now() })
  const wait = (ms: number) => sleep(ms * pace, signal)
  let thinkingIndex = 0
  let tokenIndex = 0
  let toolSeq = 0
  const thought: string[] = []
  const answer: string[] = []
  const sources: WSSource[] = []
  const highlights: WSHighlight[] = []
  const followups: string[] = []
  const errors: WSTurnError[] = []
  let model: string | undefined
  let tokens: number | undefined

  try {
    await wait(PACING.beforeFirstEvent)

    for (const step of scenario) {
      switch (step.kind) {
        case 'thinking': {
          // The separator travels in the stream so the joined chunks equal the thought.
          const text = thought.length ? `\n\n${step.text}` : step.text
          for (const chunk of chunkText(text)) {
            send({ type: 'thinking', text: chunk, index: thinkingIndex++, ...base() })
            await wait(PACING.perThinkingChunk)
          }
          thought.push(text)
          break
        }
        case 'tool': {
          const toolCallId = `${streamId}-tool-${toolSeq++}`
          const { name, input } = step
          send({ type: 'tool', name, toolCallId, status: 'started', input, ...base() })
          await wait(step.durationMs ?? PACING.defaultToolMs)
          if ((step.outcome ?? 'completed') === 'completed') {
            const output = step.output
            send({ type: 'tool', name, toolCallId, status: 'completed', output, ...base() })
          } else {
            const error = step.error ?? 'Tool call failed'
            send({ type: 'tool', name, toolCallId, status: 'failed', error, ...base() })
          }
          break
        }
        case 'answer': {
          // The first answer step marks the end of reasoning.
          if (thought.length && answer.length === 0)
            send({ type: 'thought', text: thought.join(''), ...base() })
          for (const text of chunkText(step.text)) {
            send({ type: 'token', text, index: tokenIndex++, ...base() })
            await wait(PACING.perTokenChunk)
          }
          answer.push(step.text)
          if (step.sources) sources.push(...step.sources)
          if (step.highlights) highlights.push(...step.highlights)
          if (step.followups) followups.push(...step.followups)
          if (step.errors) errors.push(...step.errors)
          model = step.model ?? model
          tokens = step.tokens ?? tokens
          break
        }
        case 'error': {
          const { kind: _kind, ...fault } = step
          send({ type: 'error', ...fault, ...base() })
          if (!step.recoverable) return
          break
        }
      }
      await wait(PACING.betweenSteps)
    }

    if (answer.length) {
      send({
        type: 'summary',
        text: answer.join(''),
        sources: sources.length ? sources : undefined,
        highlights: highlights.length ? highlights : undefined,
        followups: followups.length ? followups : undefined,
        errors: errors.length ? errors : undefined,
        model,
        tokens,
        ...base(),
      })
    }
  } catch (err) {
    if (signal.aborted) return
    throw err
  }
}

// WebSocket.readyState values, spelled out: a test environment may not define
// the constants on the global.
const CONNECTING = 0
const OPEN = 1
const CLOSED = 3

/**
 * Builds the `connect` function `createWsResponder` takes: every call is one
 * connection attempt, answered according to whatever `condition()` says at
 * that moment — so a story can change the network between two questions.
 */
function createSimulatedServer(condition: () => NetworkCondition): (url: string) => ChatSocket {
  const pickScenario = createScenarioPicker()
  let attempts = 0
  let streams = 0

  return function connect() {
    const spec = NETWORK[condition()]
    const attempt = ++attempts
    const hangUp = new AbortController()
    let readyState: ChatSocket['readyState'] = CONNECTING

    const socket: ChatSocket = {
      get readyState() {
        return readyState
      },
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      // The client's one message: {type: 'chat', prompt}.
      send(data) {
        if (readyState !== OPEN) return
        let prompt: unknown
        try {
          prompt = (JSON.parse(String(data)) as { prompt?: unknown }).prompt
        } catch {
          return
        }
        if (typeof prompt !== 'string') return

        let chunks = 0
        const deliver = (event: WSEvent) => {
          if (readyState !== OPEN) return
          emit('onmessage', new MessageEvent('message', { data: JSON.stringify(event) }))
          if (event.type === 'token' && ++chunks === spec.dropAfterChunks) end()
        }
        void runScenario(
          pickScenario(prompt),
          `sim-${++streams}`,
          spec.pace,
          deliver,
          hangUp.signal,
        )
      },
      // The client hanging up. Like a real socket, it is not told about a close
      // it asked for itself once it has dropped its handlers.
      close() {
        end()
      },
    }

    // The handlers are typed for a real WebSocket as `this`; the client's never
    // read it, so the stand-in is passed for honesty rather than need.
    function emit(handler: 'onopen' | 'onmessage' | 'onerror' | 'onclose', event: Event) {
      const listener = socket[handler] as ((this: ChatSocket, event: Event) => unknown) | null
      listener?.call(socket, event)
    }

    function end() {
      if (readyState === CLOSED) return
      readyState = CLOSED
      hangUp.abort()
      emit('onclose', new Event('close'))
    }

    sleep(spec.connectMs, hangUp.signal).then(
      () => {
        if (spec.refuses?.(attempt)) {
          // A refused connection errors while still not open, then closes.
          readyState = CLOSED
          emit('onerror', new Event('error'))
          emit('onclose', new Event('close'))
          return
        }
        readyState = OPEN
        emit('onopen', new Event('open'))
      },
      // The client gave up before the handshake finished.
      () => {},
    )

    return socket
  }
}

/** The address the stories "connect" to. Never resolved: nothing is sent to it. */
const SIMULATED_URL = 'wss://simulated.invalid/chat'

/** The real WebSocket responder, over the simulated server. */
function createSimulatedResponder(
  condition: NetworkCondition | (() => NetworkCondition),
): Responder {
  const read = typeof condition === 'function' ? condition : () => condition
  return createWsResponder(SIMULATED_URL, createSimulatedServer(read))
}

/**
 * A responder for a story whose network is an arg. It keeps its identity when
 * the condition changes — `useChat` needs a stable responder — and the next
 * question simply meets the new network.
 */
export function useSimulatedResponder(condition: NetworkCondition): Responder {
  const current = useRef(condition)
  useEffect(() => {
    current.current = condition
  }, [condition])
  return useMemo(() => createSimulatedResponder(() => current.current), [])
}
