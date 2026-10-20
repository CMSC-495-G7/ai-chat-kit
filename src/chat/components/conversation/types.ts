import { type ReactNode } from 'react'
import {
  type AskedOverChip,
  type AskedOverScope,
  type ChainControls,
  type ComposerFeatures,
  type Message,
  type QueueMove,
  type QueuedMessage,
  type Suggestion,
} from '../../engine/types'

export type ConversationProps = {
  disclaimer?: string
  greeting?: ReactNode
  messages: Message[]
  busy: boolean
  /** Messages written but not yet run — the dock above the composer. */
  queue: QueuedMessage[]
  held: boolean
  onSubmit: (text: string) => void
  onStop: () => void
  onSendNow: (text: string) => void
  /** Filters in force now — a question recorded under different ones says so. */
  scopeChips?: AskedOverChip[]
  onRestoreScope?: (scope: AskedOverScope) => void
  onSendQueuedNow: (id: number) => void
  onEditQueued: (id: number, text: string) => void
  onMoveQueued: (id: number, to: QueueMove) => void
  onRemoveQueued: (id: number) => void
  onHold: () => void
  onResume: () => void
  onClearQueue: () => void
  onRetry: (id: number) => void
  /** The chain being built or run, and its controls. */
  chain: ChainControls
  /** Composer features switched on for this viewer. */
  features?: ComposerFeatures
  /** Today's suggested questions, and more for suggest-as-you-type. */
  suggestions: Suggestion[]
  typeaheadPool?: Suggestion[]
  /** Demo toggle: the copy / regenerate / vote row under a finished answer. */
  showActions?: boolean
}
