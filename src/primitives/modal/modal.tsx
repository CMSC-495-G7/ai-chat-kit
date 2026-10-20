import { useEffect, useId, useRef, useState } from 'react'
import { CollapseDiagonalIcon, ExpandDiagonalIcon, XIcon } from '../icons'
import { IconButton } from '../icon-button'
import { Tooltip } from '../tooltip'
import type { ModalIconTone, ModalProps, ModalSize } from './types'

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const iconTones: Record<ModalIconTone, string> = {
  brand: 'bg-chip text-brand-fg ring-brand-fg/15',
  neutral: 'bg-ink-soft/10 text-ink-soft ring-line',
  success: 'bg-success-surface text-success-fg ring-success-line',
  warning: 'bg-caution-surface text-caution ring-caution-line',
  danger: 'bg-danger/8 text-danger-fg ring-danger/20',
}

/**
 * A controlled modal built on the native top-layer `<dialog>`.
 *
 * The browser owns modality, focus containment, Escape handling and returning
 * focus to the trigger. The component owns the branded surface and reports
 * every dismissal through `onOpenChange`, so callers keep one source of truth.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  icon,
  iconTone = 'brand',
  showCloseButton = true,
  closeLabel = 'Close dialog',
  expandable = false,
  expandLabel = 'Expand dialog',
  restoreLabel = 'Restore dialog size',
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  initialFocusRef,
  className = '',
  contentClassName = '',
  ...rest
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      initialFocusRef?.current?.focus()
    }
    if (!open && dialog.open) {
      dialog.close()
      setExpanded(false)
    }
  }, [initialFocusRef, open])

  const requestClose = () => onOpenChange(false)

  return (
    <dialog
      {...rest}
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={[
        'fixed inset-0 m-auto h-fit max-h-none w-full max-w-none overflow-visible border-0 bg-transparent p-4 text-inherit',
        'backdrop:bg-scrim/45 backdrop:backdrop-blur-[2px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissOnEscape) requestClose()
      }}
      onClose={requestClose}
      onClick={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) requestClose()
      }}
    >
      <div
        data-expanded={expanded || undefined}
        className={[
          'relative mx-auto flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-dialog',
          'border border-line bg-panel-solid shadow-2xl shadow-(color:--shadow-deep)',
          'transition-[width,height,max-width,max-height] duration-200 motion-reduce:transition-none',
          'data-[expanded=true]:h-[80dvh] data-[expanded=true]:max-h-[80dvh] data-[expanded=true]:w-[80vw] data-[expanded=true]:max-w-[80vw]',
          sizes[size],
          contentClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className={`flex items-start gap-3 px-5 pt-5 ${children ? 'pb-3' : 'pb-5'}`}>
          {icon && (
            <span
              aria-hidden="true"
              className={`inline-grid size-9 shrink-0 place-items-center rounded-control ring-1 ${iconTones[iconTone]} [&>svg]:size-[18px]`}
            >
              {icon}
            </span>
          )}

          <div
            className={`min-w-0 flex-1 ${expandable && showCloseButton ? 'pr-20' : expandable || showCloseButton ? 'pr-8' : ''}`}
          >
            <h2 id={titleId} className="text-base font-extrabold tracking-tight text-ink-strong">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {description}
              </p>
            )}
          </div>

          {(expandable || showCloseButton) && (
            <div className="absolute top-3.5 right-3.5 flex items-center gap-0.5">
              {expandable && (
                <Tooltip content={expanded ? restoreLabel : expandLabel}>
                  <IconButton
                    size="md"
                    active={expanded}
                    aria-pressed={expanded}
                    onClick={() => setExpanded((value) => !value)}
                    aria-label={expanded ? restoreLabel : expandLabel}
                  >
                    {expanded ? (
                      <CollapseDiagonalIcon width={15} height={15} />
                    ) : (
                      <ExpandDiagonalIcon width={15} height={15} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {showCloseButton && (
                <Tooltip content={closeLabel}>
                  <IconButton size="md" onClick={requestClose} aria-label={closeLabel}>
                    <XIcon width={15} height={15} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )}
        </header>

        {children && (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-5 text-[13px] leading-relaxed text-ink">
            {children}
          </div>
        )}

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-tint/3 px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  )
}
