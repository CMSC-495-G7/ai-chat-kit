import { useEffect, useRef } from 'react'
import type { SlideOverProps } from './types'
/** A contained drawer. Focus returns to its trigger when it closes. */
export function SlideOver({
  open,
  onClose,
  label,
  children,
  position = 'absolute',
  scrimClassName = 'bg-scrim/30',
  shadow = true,
  side = 'left',
  className = '',
}: SlideOverProps) {
  const close = useRef(onClose)
  close.current = onClose
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const panel = ref.current
    const controls = () =>
      [
        ...(panel?.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input,select,textarea,[tabindex="0"]',
        ) ?? []),
      ].filter((element) => element.getClientRects().length > 0)
    ;(controls()[0] ?? panel)?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault()
        close.current()
      }
      if (e.key === 'Tab') {
        const list = controls()
        const at = list.indexOf(document.activeElement as HTMLElement)
        if (list.length === 0) {
          e.preventDefault()
          panel?.focus()
        } else if (e.shiftKey && at <= 0) {
          e.preventDefault()
          list[list.length - 1].focus()
        } else if (!e.shiftKey && (at === -1 || at === list.length - 1)) {
          e.preventDefault()
          list[0].focus()
        }
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('keydown', key)
      previous?.focus()
    }
  }, [open])
  if (!open) return null
  return (
    <>
      <button
        type="button"
        aria-label={`Close ${label.toLowerCase()}`}
        onClick={onClose}
        className={`${position} inset-0 z-30 cursor-default ${scrimClassName}`}
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`${position} inset-y-0 z-40 flex ${shadow ? 'shadow-xl shadow-(color:--shadow-deep)' : ''} ${side === 'left' ? 'left-0' : 'right-0'} ${className}`}
      >
        {children}
      </div>
    </>
  )
}
