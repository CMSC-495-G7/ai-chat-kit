import { ChevronDownIcon } from '../icons'
import type { ScrollToBottomButtonProps } from './types'

/**
 * Floating pill that appears once the reader has scrolled away from the
 * bottom of a stream, and jumps back down on click. Purely presentational —
 * position it inside a `relative` ancestor and drive `visible`/`onClick` from
 * `useStickToBottom`'s `atBottom`/`scrollToBottom`. No knowledge of chat,
 * messages, or any other app concept, so it (and the hook) can move to
 * another surface — or another library — without pulling this one along.
 */
export function ScrollToBottomButton({
  visible,
  onClick,
  label = 'New messages',
  className = '',
}: ScrollToBottomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-control border border-line bg-panel-solid px-3.5 py-2 text-xs font-medium text-ink shadow-md shadow-(color:--shadow-bubble) transition duration-200 hover:border-brand-fg/40 hover:text-ink-strong ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      } ${className}`}
    >
      {label}
      <ChevronDownIcon width={14} height={14} />
    </button>
  )
}
