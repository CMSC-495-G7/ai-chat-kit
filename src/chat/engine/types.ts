import type { ReactNode } from 'react'

/** One tool call made by the assistant while producing a response. */
export type ToolCall = {
  toolCallId: string
  name: string
  status: 'started' | 'completed' | 'failed'
  input?: Record<string, unknown>
  output?: unknown
  error?: string
}

/**
 * One problem reported during a turn — a dropped connection, a failed tool, a
 * degraded subsystem.
 *
 * Responders report these two ways and both end up here: streamed as they
 * happen (which is how the fault earns a place on the timeline), or listed in
 * bulk when the answer completes (which is how a server that only tallies
 * problems at the end reports them). Everything past `message` is optional, so
 * a responder that knows nothing but the text still works.
 */
export type TurnFault = {
  message: string
  /** Stable machine code, when the responder supplies one. Also the identity
   *  used to dedupe a fault that arrives by both routes. */
  code?: string
  /** Which part of the turn it came from — 'retrieval', 'tool:live_quote'. */
  source?: string
  /** Times it occurred, when the responder collapses repeats. */
  count?: number
  /** Structured payload; the row expands to show it as JSON. */
  detail?: Record<string, unknown>
}

/**
 * One phase of an assistant turn, timed from the turn's start. Reasoning,
 * answering, and each tool call get a step; so does any fault, which is the
 * only kind carrying a `fault` payload.
 */
export type TurnStep = {
  /** Unique within a turn. Tool steps use their toolCallId. */
  id: string
  /** 'Reasoning', 'Answering', or the tool's own name. */
  label: string
  kind: 'thinking' | 'tool' | 'content' | 'fault'
  /**
   * Milliseconds from the turn's start. Absent on a fault the server reported
   * only at the end — we genuinely don't know when it happened, and inventing
   * a timestamp would put it in the wrong place on the timeline.
   */
  at?: number
  /** How long the step ran; absent while it is still open. */
  ms?: number
  /** Only on 'fault' steps. */
  fault?: TurnFault
}

/**
 * What happened during one assistant turn: how long it took, and what it did
 * along the way.
 *
 * `status` is the turn's outcome, which a single error flag can't express:
 * 'recovered' means something went wrong mid-stream but the answer still
 * arrived, so the reader has nothing to act on; 'stopped' means they ended it
 * themselves. Only 'failed' means there is no answer — and only 'failed' sets
 * `Message.error`.
 */
export type TurnTrace = {
  status: 'ok' | 'recovered' | 'stopped' | 'failed'
  /** Epoch ms the turn started; every step's `at` is relative to this. */
  startedAt: number
  /** Total wall time; absent while the turn is still streaming. */
  ms?: number
  model?: string
  tokens?: number
  steps: TurnStep[]
}

/** A reference document the assistant cites with inline [n] markers. */
export type Source = {
  id: number
  title: string
  markdown: string
  /**
   * Link to the original document (its own PDF, page, or file), opened in a
   * new tab. The rendered `markdown` is the assistant's excerpt, not the source
   * itself — this is what lets a reader leave the excerpt and get the real
   * file. Omit when there's nothing to link to; every "Open original"
   * affordance hides itself rather than rendering disabled.
   */
  url?: string
  /** Short file-type label shown next to the source, e.g. "PDF". */
  fileType?: string
  /** Page count of the source document, if known. */
  pageCount?: number
  /** Human-readable "last updated" label, e.g. "Mar 2026". */
  updatedLabel?: string
}

/**
 * One passage to highlight, as character offsets into the source document's
 * markdown. `idx` is a stable per-section id, not a reference — used only as a
 * key.
 */
export type HighlightSection = {
  idx: number
  start: number
  end: number
}

/**
 * The passages of a cited source to highlight. `referenceNumber` is the source
 * id (the [n] marker the chip shows); opening that reference highlights every
 * section here. One source can own several sections.
 */
export type Highlight = {
  referenceNumber: number
  sections: HighlightSection[]
}

/**
 * A message the reader has written but that hasn't run yet. Queued turns live
 * outside `Message[]` on purpose: the transcript is a record of what happened,
 * and a message that hasn't been sent has no place in it. It also means a
 * queued turn can't be shoved around by a streaming answer growing beneath it.
 */
export type QueuedMessage = {
  id: number
  text: string
}

/** Where a queued message should end up: one step, the front, or an exact
 *  index (a drop). Relative steps are named so a bare number is never
 *  ambiguous. */
export type QueueMove = 'up' | 'down' | 'front' | number

/**
 * A chain: queued questions the reader lines up to run one after another.
 * `planning` holds the queue while steps are added; `running` counts progress
 * against the number of steps it started with (plus any added on the way).
 */
export type ChainState = { phase: 'planning' } | { phase: 'running'; total: number }

/** A chain and what can be done to it — one object, so hosts pass it through
 *  whole rather than as five props. `useChat` returns one. */
export type ChainControls = {
  state: ChainState | null
  /** Start building: the queue holds until the chain is run. */
  start: () => void
  /** Add a step, starting a chain if none is being built. */
  add: (text: string) => void
  /** Run the chain as built. */
  run: () => void
  /** Stop building. Steps already added stay queued, held. */
  cancel: () => void
}

/**
 * Composer features a host can switch off — the data-free counterpart of the
 * message feature gate. Both default to on; a host passes what its flags say.
 */
export type ComposerFeatures = {
  /** The sparkle drop-up of today's suggestions, and suggest-as-you-type. */
  suggestions?: boolean
  /** Queueing and steering while an answer runs, and chains. */
  queue?: boolean
}

/** One of the tenant's suggested questions for the day. */
export type Suggestion = {
  text: string
  /** Why it is suggested — "Popular in your org", "New this week". */
  reason?: string
}

export type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  thinkingActive?: boolean
  thinkingSec?: number
  streaming?: boolean
  /** Assistant message whose stream was interrupted; partial content is kept. */
  stopped?: boolean
  tools?: ToolCall[]
  sources?: Source[]
  highlights?: Highlight[]
  /** Suggested next prompts, written in the user's voice — picking one sends it verbatim. */
  followups?: string[]
  /** What this question was asked over. User messages only, and optional:
   *  a host with no filters never sets it and nothing renders. */
  askedOver?: AskedOverScope
  /** What the turn did and how long it took. Assistant messages only. */
  trace?: TurnTrace
  /**
   * Set only when the turn produced no answer. A recoverable fault is not an
   * error the reader has to act on — it lands on `trace` as a 'fault' step
   * instead, so a turn that stumbled and then answered still reads as answered.
   *
   * Carries the same shape as a recoverable fault, so a fatal error gets a code
   * and a source too.
   */
  error?: TurnFault
}

/** A selectable assistant persona shown in the composer's persona menu. */
export type Persona = {
  id: string
  name: string
  hint: string
}

/** One row in the widget's Recent chats side panel. */
export type RecentChat = {
  id: string
  title: string
  snippet: string
  when: string
}

/**
 * One layer of the stacked prompt template shown in the widget's Persona side
 * panel. Layers apply in ascending `priority` — 1 is the base every later layer
 * builds on — so the panel orders by that field rather than by array order.
 */
export type PromptTemplate = {
  id: string
  /** 1 applies first. Ties keep their given order. */
  priority: number
  /** What this layer contributes ("Base persona", "Compliance"). */
  label?: string
  body: string
}

/** A side-rail tab plus its panel, injected into the widget by the host. */
/**
 * One filter recorded on a question: what it constrained, and enough to
 * render it years later.
 *
 * `label` and `prefix` are stored, not just `ref`, because a transcript has to
 * render after a group is renamed or a value retired — and resolving an old id
 * against today's index is precisely the lookup that fails. `ref` is kept only
 * so a restore has something to replay.
 */
export type AskedOverChip = {
  /** Decides the chip's shape, nothing else. */
  kind: 'scope' | 'facet' | 'query' | 'custom'
  /** The field, rendered ahead of the label: "Merchant: Delta Air Lines". */
  prefix?: string
  label: string
  /** For a query chip: how many values it matched when this was recorded. */
  count?: number
  ref?: { group: string; value: string }
}

/**
 * The scope a question was asked under — a snapshot, never a view.
 *
 * Captured when the turn is dispatched and stored on the message. It must not
 * be derived from live filter state at render time: a strip that re-read the
 * current scope would rewrite history every time someone ticked a box, and the
 * one question it exists to answer — what was this answer computed over — is
 * the one it would stop being able to answer.
 */
export type AskedOverScope = {
  /** Items in scope at the time. Recorded, never recomputed. */
  total: number
  chips: AskedOverChip[]
  capturedAt: string
}

export type SidePanel = {
  id: string
  label: string
  icon: ReactNode
  /** Optional count bubble on the rail icon. */
  badge?: number
  /** Panel header title. */
  title: string
  /**
   * Panel body — a self-contained (optionally stateful) node.
   *
   * As a function it receives the panel's own controls, which is what a body
   * needs when it carries its own dismissal: a filter panel covers the
   * conversation it is filtering, so its footer has to be able to close it
   * without reaching for the header's close button.
   */
  content: ReactNode | ((api: SidePanelApi) => ReactNode)
  /** The body lays itself out, including its own padding and scrolling. */
  fill?: boolean
}

export type SidePanelApi = {
  /** Close this panel and return the chat column. */
  close: () => void
}
