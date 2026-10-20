// The conversation "engine": the message shape plus a pluggable responder.
//
// A Responder turns a prompt into a stream of ChatEvents. The UI and the
// useChat hook only know about this interface, so swapping the canned demo
// responder for one backed by a real streaming API (e.g. createWsResponder)
// needs no changes anywhere else.

// Shared domain shapes live in ../types; this module owns the streaming
// contract (events, responder) that consumes them.
import type { Highlight, Source, ToolCall, TurnFault } from './types'

// Deltas carry their own whitespace — consumers concatenate them verbatim.
// The optional fullText on thinking-done/done lets a server replace the
// accumulated text with its authoritative joined copy.
export type ChatEvent =
  | { type: 'thinking'; delta: string }
  | { type: 'thinking-done'; fullText?: string }
  | { type: 'content'; delta: string }
  // `errors` are faults the responder only reports once the answer is
  // complete — they carry no timing, unlike a streamed 'error' event.
  | {
      type: 'done'
      fullText?: string
      model?: string
      tokens?: number
      errors?: TurnFault[]
    }
  | { type: 'tool'; toolCall: ToolCall }
  | { type: 'sources'; sources: Source[]; highlights?: Highlight[] }
  | { type: 'followups'; items: string[] }
  | { type: 'error'; fault: TurnFault; recoverable: boolean }

export type Responder = (prompt: string, signal: AbortSignal) => AsyncGenerator<ChatEvent>

export type CannedTurn = {
  thinking: string
  content: string
  sources?: Source[]
  /** Passages to highlight in this turn's cited source docs (by referenceNumber). */
  highlights?: Highlight[]
  /** Suggested next prompts, phrased as the user would type them. */
  followups?: string[]
  /** Reported on `done`, for the turn's trace. */
  model?: string
  tokens?: number
  /** Plays an error partway through the answer. `at` is the fraction of the
   *  content to emit first (0–1). By default the stream carries on and the turn
   *  still completes ('recovered'); with `fatal` it ends there instead
   *  ('failed'), leaving the partial answer in place. */
  fault?: { at: number; fatal?: boolean } & TurnFault
  /** Faults reported with the finished answer rather than as they happen —
   *  the shape a server that only tallies problems at the end sends. */
  errors?: TurnFault[]
  /** When set, a prompt matching this pattern plays this turn instead of the
   *  next one in the cycle — handy for demo turns you want on demand. */
  match?: RegExp
}

// Pacing for the simulated stream, in milliseconds. Tune the whole feel here.
const PACING = {
  beforeFirstToken: 450,
  perThinkingWord: 28,
  thinkingToContent: 500,
  perContentWord: 32,
  faultStall: 900,
}

/** A cancellable delay that rejects with an AbortError when the signal fires. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

/** Splits text into words that keep their trailing whitespace, so joining the
 *  pieces with '' reproduces the original exactly (newlines included). */
const wordsWithSpace = (text: string) => text.split(/(?<=\s)/)

/**
 * Builds a Responder that replays canned turns word by word, cycling through
 * them. Stands in for a real model while keeping the same streaming contract.
 */
export function createCannedResponder(turns: CannedTurn[]): Responder {
  let index = 0
  const cycle = turns.filter((t) => !t.match)
  return async function* respond(prompt, signal) {
    const turn = turns.find((t) => t.match?.test(prompt)) ?? cycle[index++ % cycle.length]

    await sleep(PACING.beforeFirstToken, signal)
    for (const word of wordsWithSpace(turn.thinking)) {
      yield { type: 'thinking', delta: word }
      await sleep(PACING.perThinkingWord, signal)
    }

    await sleep(PACING.thinkingToContent, signal)
    yield { type: 'thinking-done' }

    // Sources land before the content streams so [n] citation markers are
    // resolvable (and clickable) the moment they appear. Their highlights ride
    // along so opening a reference can light up its supporting passages.
    if (turn.sources?.length)
      yield { type: 'sources', sources: turn.sources, highlights: turn.highlights }

    const words = wordsWithSpace(turn.content)
    // A scripted fault interrupts the answer without ending it: the stream
    // stalls, reports itself, and resumes where it left off.
    const faultAt = turn.fault ? Math.floor(words.length * turn.fault.at) : -1
    for (const [i, word] of words.entries()) {
      if (i === faultAt) {
        await sleep(PACING.faultStall, signal)
        const { at: _at, fatal, ...fault } = turn.fault!
        yield { type: 'error', fault, recoverable: !fatal }
        // A fatal fault ends the response where it stands — no done, no
        // follow-ups, and whatever streamed so far stays on screen.
        if (fatal) return
      }
      yield { type: 'content', delta: word }
      await sleep(PACING.perContentWord, signal)
    }
    yield { type: 'done', model: turn.model, tokens: turn.tokens, errors: turn.errors }

    // Follow-ups land last: nothing in the answer text resolves against them,
    // and they only make sense once the reader has the whole answer.
    if (turn.followups?.length) yield { type: 'followups', items: turn.followups }
  }
}
