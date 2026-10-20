export type ScrollToBottomButtonProps = {
  /** Rendered (with an enter transition) only while true — pass `atBottom === false`. */
  visible: boolean
  onClick: () => void
  /** Defaults to "New messages". Pass e.g. an unread count if the caller tracks one. */
  label?: string
  className?: string
}
