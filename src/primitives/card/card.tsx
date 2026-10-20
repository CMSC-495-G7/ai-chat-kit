import { useEffect, useId, useRef, useState } from 'react'
import { IconButton } from '../icon-button'
import { DotsIcon, GripIcon } from '../icons'
import { useUiSize } from '../../lib/uiSize'
import { IconTile } from '../icon-tile'
import type { CardProps } from './types'

/**
 * A content surface, drawn open: no rules between its parts. An eyebrow names
 * the kind of card, the title leads, and spacing does the separating; the
 * footer sits on the bottom edge. `href` makes the whole card a link.
 * Dragging is opt-in; layout stays with the parent.
 */
export function Card({
  title,
  eyebrow,
  description,
  icon,
  iconTone = 'neutral',
  headingLevel = 3,
  headerAction,
  footer,
  href,
  actions = [],
  draggable = false,
  onMove,
  dragLabel = 'Move card',
  keyboardMoveStep = 10,
  dragDescription = `Drag to move, or use arrow keys to move ${keyboardMoveStep} pixels.`,
  actionsLabel = 'More card actions',
  actionsMenuLabel = 'Card actions',
  onMoveStart,
  onMoveEnd,
  children,
  className = '',
  ...rest
}: CardProps) {
  const heading = useId()
  const hint = useId()
  const menu = useId()
  const compact = useUiSize() === 'compact'
  const root = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const previous = useRef<{ x: number; y: number } | null>(null)
  const [open, setOpen] = useState(false)
  const [moving, setMoving] = useState(false)
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!event.composedPath().includes(root.current!)) setOpen(false)
    }
    const document = root.current?.ownerDocument
    document?.addEventListener('pointerdown', dismiss)
    return () => document?.removeEventListener('pointerdown', dismiss)
  }, [open])
  const finishMove = (cancelled: boolean) => {
    if (!previous.current) return
    previous.current = null
    setMoving(false)
    onMoveEnd?.(cancelled)
  }
  const Heading = `h${headingLevel}` as const
  const hasTools = headerAction != null || actions.length > 0

  return (
    <section
      {...rest}
      ref={root}
      aria-labelledby={heading}
      data-link={href ? '' : undefined}
      className={[
        'relative flex min-w-0 flex-col rounded-surface border border-line bg-panel-solid text-ink shadow-sm shadow-(color:--shadow-soft)',
        compact ? 'gap-3 p-4' : 'gap-4 p-5.5',
        href
          ? 'transition-[translate,box-shadow] duration-200 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_var(--shadow-raised)] has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-(--focus-ring) motion-reduce:transition-none motion-reduce:hover:translate-y-0'
          : '',
        moving ? 'shadow-[0_14px_30px_-12px_var(--shadow-raised)] ring-2 ring-(--focus-ring)' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onBlur={(event) => {
        rest.onBlur?.(event)
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event)
        if (event.key === 'Escape' && open) {
          setOpen(false)
          trigger.current?.focus()
        }
      }}
    >
      <header className="flex min-w-0 items-start gap-2.5">
        {draggable && (
          <>
            <IconButton
              aria-label={dragLabel}
              aria-describedby={hint}
              className="relative z-1 -my-1 -ml-1.5 touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={(event) => {
                if (event.button !== 0) return
                previous.current = { x: event.clientX, y: event.clientY }
                event.currentTarget.setPointerCapture(event.pointerId)
                setMoving(true)
                onMoveStart?.()
              }}
              onPointerMove={(event) => {
                if (!previous.current) return
                onMove?.({
                  x: event.clientX - previous.current.x,
                  y: event.clientY - previous.current.y,
                })
                previous.current = { x: event.clientX, y: event.clientY }
              }}
              onPointerUp={() => finishMove(false)}
              onPointerCancel={() => finishMove(true)}
              onLostPointerCapture={() => finishMove(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && previous.current) {
                  event.preventDefault()
                  finishMove(true)
                  return
                }
                if (previous.current) return
                const steps: Record<string, [number, number]> = {
                  ArrowLeft: [-keyboardMoveStep, 0],
                  ArrowRight: [keyboardMoveStep, 0],
                  ArrowUp: [0, -keyboardMoveStep],
                  ArrowDown: [0, keyboardMoveStep],
                }
                const step = steps[event.key]
                if (step) {
                  event.preventDefault()
                  onMove?.({ x: step[0], y: step[1] })
                }
              }}
            >
              <GripIcon />
            </IconButton>
            <span id={hint} className="sr-only">
              {dragDescription}
            </span>
          </>
        )}
        {icon != null && (
          <IconTile tone={iconTone === 'warning' ? 'warning' : 'muted'} size={34}>
            {icon}
          </IconTile>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {eyebrow != null && (
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-brand-fg uppercase">
              {eyebrow}
            </span>
          )}
          <Heading
            id={heading}
            className={`m-0 leading-snug font-extrabold text-ink-strong ${compact ? 'text-[15px]' : 'text-[17px]'}`}
          >
            {href ? (
              <a
                href={href}
                data-card-link=""
                className="text-inherit no-underline outline-none after:absolute after:inset-0 after:rounded-[inherit]"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </Heading>
          {description != null && <p className="m-0 text-[12.5px] text-ink-soft">{description}</p>}
        </div>
        {hasTools && (
          <div className="relative z-1 -my-1 -mr-1.5 flex shrink-0 items-center gap-1">
            {headerAction}
            {actions.length > 0 && (
              <IconButton
                ref={trigger}
                aria-label={actionsLabel}
                aria-expanded={open}
                aria-controls={menu}
                active={open}
                onClick={() => setOpen(!open)}
              >
                <DotsIcon className="rotate-90" />
              </IconButton>
            )}
            {open && (
              <div
                id={menu}
                role="group"
                aria-label={actionsMenuLabel}
                className="absolute top-full right-0 z-10 mt-1 min-w-44 rounded-surface border border-line bg-panel-solid p-1 shadow-lg shadow-(color:--shadow-menu)"
              >
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={action.disabled}
                    className="block w-full rounded-control px-3 py-2 text-left text-[13px] hover:bg-tint/8 disabled:opacity-40"
                    onClick={() => {
                      setOpen(false)
                      trigger.current?.focus()
                      action.onSelect()
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
      {children != null && <div className="min-w-0">{children}</div>}
      {footer != null && (
        <footer className="mt-auto flex min-w-0 flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
          {footer}
        </footer>
      )}
    </section>
  )
}
