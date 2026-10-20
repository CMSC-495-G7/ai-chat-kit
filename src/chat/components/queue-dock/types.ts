import type { ChainControls, QueueMove, QueuedMessage } from '../../engine/types'

export type QueueDockProps = {
  /** Messages written but not yet run, in the order they will run. */
  items: QueuedMessage[]
  /** The queue is paused: nothing dispatches until the reader resumes it. */
  held: boolean
  /** A turn is running, so item one is what happens when it finishes. */
  busy: boolean
  /** What is being typed in the composer. Given and not empty, a ghost row at
   *  the end of the list shows where it will land. */
  draft?: string
  /** Run this message now, interrupting whatever is in flight. */
  onSendNow: (id: number) => void
  /** Rewrite a queued message. Empty text removes it. */
  onEdit: (id: number, text: string) => void
  onMove: (id: number, to: QueueMove) => void
  onRemove: (id: number) => void
  onHold: () => void
  onResume: () => void
  onClear: () => void
  /** The chain being built or run. Building, the dock shows even when empty —
   *  it is where the questions go — and offers Run in place of Pause. */
  chain?: ChainControls
}

/** Lets the composer hand focus to the queue (Up arrow on an empty draft). */
export type QueueDockHandle = {
  focusLast: () => void
}

export type QueueRowProps = {
  item: QueuedMessage
  index: number
  total: number
  /** First in line: the one the running turn hands off to. */
  next: boolean
  held: boolean
  busy: boolean
  /** Part of a queue still being built: nothing runs until it is started. */
  planning?: boolean
  /** Compact density shows no inline actions — everything is in the menu. */
  compact: boolean
  /** Folded dock: one line, no controls but the menu. */
  minimized: boolean
  onSendNow: (id: number) => void
  onEdit: (id: number, text: string) => void
  onMove: (id: number, to: QueueMove) => void
  onRemove: (id: number) => void
  /** Move focus to the row above or below — arrow keys walk the queue. */
  onFocusSibling: (from: number, delta: -1 | 1) => void
  registerRef: (id: number, el: HTMLLIElement | null) => void
}

export type QueueToggleProps = {
  compact: boolean
  /** A chain is being built. */
  pressed: boolean
  onClick: () => void
}
