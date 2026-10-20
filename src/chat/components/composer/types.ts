import type { ChainControls, Suggestion } from '../../engine/types'

export type ComposerProps = {
  docked: boolean
  disabled?: boolean
  /** A response is streaming: the send button becomes a stop button. With
   *  `queueing` on, Enter queues and Cmd/Ctrl+Enter steers meanwhile. */
  streaming?: boolean
  onStop?: () => void
  onSubmit: (text: string, opts?: { steer?: boolean }) => void
  /** Up arrow on an empty draft — hands focus to the queue dock, when there
   *  is one. Omitted, the key does nothing. */
  onArrowUp?: () => void
  /** Writing while an answer runs: Enter queues the message, Cmd/Ctrl+Enter
   *  steers (interrupts and sends now). Off, the box only offers Stop until
   *  the answer finishes, and the draft waits. Defaults to on. */
  queueing?: boolean
  /** The chain controls. Given, the Queue button appears; building a queue,
   *  Enter adds a step. Omitted, there are no chains. */
  chain?: ChainControls
  /** Today's suggested questions. Given, the sparkle drop-up and suggest-as-
   *  you-type appear; omitted or empty, neither does. */
  suggestions?: Suggestion[]
  /** More questions suggest-as-you-type may match, after today's list. */
  typeaheadPool?: Suggestion[]
  /** Persists the suggest-as-you-type switch. Scope it per surface and
   *  viewer; omitted, the choice lasts for this session only. */
  typeaheadStorageKey?: string
  /** Called with the draft on every change, so the queue dock can show where
   *  it will land. Omitted, nothing watches the draft. */
  onDraftChange?: (text: string) => void
}
