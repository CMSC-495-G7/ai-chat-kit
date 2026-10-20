import type { MessageActionsProps } from './types'

/**
 * The row of controls under a message.
 *
 * The revealing variant hides with opacity, never `display`, so the row keeps
 * its place in the tab order and the transcript does not jump when a pointer
 * crosses it. It reveals against the whole turn, which must therefore carry
 * `group/turn`, and it is always visible where there is no hover at all.
 *
 * The rule itself lives in `.message-actions` (chat/chat.css), with the
 * reasoning for each of those; the class is here so callers say `reveal`
 * rather than remembering a stylesheet name.
 */
export function MessageActions({ children, reveal = false, className = '' }: MessageActionsProps) {
  // `.message-actions` (chat/chat.css) owns the reveal — see there for why
  // it is not a pair of utilities.
  return (
    <div className={`flex items-center gap-1 ${reveal ? 'message-actions' : ''} ${className}`}>
      {children}
    </div>
  )
}
