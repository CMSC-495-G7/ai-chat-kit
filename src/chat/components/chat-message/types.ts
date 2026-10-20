import type { AskedOverChip, AskedOverScope, Message } from '../../engine/types'

export type ChatMessageProps = {
  message: Message
  /** When provided, a finished answer's follow-up suggestions are offered.
   *  Callers opt out per message by omitting it — typically every message but
   *  the last, so branches don't stack up the thread. */
  onFollowup?: (text: string) => void
  /** When provided, a failed turn offers a Retry that re-runs it. */
  onRetry?: (id: number) => void
  /** Held while a turn is in flight, so a follow-up can't jump the send queue. */
  busy?: boolean
  /** Copy / regenerate / vote row under a finished answer, and the copy
   *  action under a question. Defaults to shown. */
  showActions?: boolean
  /**
   * The filters in force now, as chips. A question recorded under different
   * ones says so. Compared against, never drawn — the message renders its own
   * snapshot. Omit when the host has no filters.
   */
  scopeChips?: AskedOverChip[]
  /** Offered on a changed record: put that scope back. */
  onRestoreScope?: (scope: AskedOverScope) => void
  /**
   * Show the one-time "citations open the source" tip on this message if it
   * has sources and the tip hasn't been dismissed yet. The caller decides
   * which message this is (typically the first cited answer in the
   * conversation) — ChatMessage itself only knows about its own message, not
   * its siblings.
   */
  showSourceTip?: boolean
}
