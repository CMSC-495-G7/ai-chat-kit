export type FollowupChipsProps = {
  /** Suggested prompts, in the user's voice — a pick sends the label verbatim. */
  items: string[]
  onPick: (text: string) => void
  /** Held while a turn is in flight, so a pick can't jump the send queue. */
  disabled?: boolean
}
