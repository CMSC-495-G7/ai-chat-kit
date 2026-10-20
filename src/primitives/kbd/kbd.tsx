import type { KbdProps } from './types'
export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="rounded border border-b-2 border-line bg-panel-solid px-1 font-sans text-[10px] font-bold text-ink-soft">
      {children}
    </kbd>
  )
}
