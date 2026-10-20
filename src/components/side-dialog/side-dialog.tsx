import { useEffect, useId, useRef } from 'react'
import { IconButton } from '../../primitives/icon-button'
import { XIcon } from '../../primitives/icons'
import type { SideDialogProps } from './types'
export function SideDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = `Close ${title.toLowerCase()}`,
  width = '26rem',
  className = '',
}: SideDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="fixed top-1/2 right-4 left-auto m-0 max-w-none -translate-y-1/2 border-0 bg-transparent p-0 backdrop:bg-scrim/25"
    >
      <div
        style={{ width, maxWidth: 'calc(100vw - 2rem)' }}
        className={`glass flex max-h-[calc(100dvh-2rem)] flex-col rounded-dialog ${className}`}
      >
        <header className="flex items-start gap-3 px-5 pt-5 pb-4">
          <div className="min-w-0 flex-1">
            <h2 id={id} className="text-base font-semibold text-ink-strong">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-snug text-ink-soft">{description}</p>
            )}
          </div>
          <IconButton size="md" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
            <XIcon width={16} height={16} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-3">{footer}</footer>}
      </div>
    </dialog>
  )
}
