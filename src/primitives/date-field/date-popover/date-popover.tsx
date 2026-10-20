// The calendar popover both date fields open. Portalled through the shared
// overlay layer (hooks/useOverlayLayer) so a field inside a scrolling panel, a
// clipped card or an open <dialog> still shows its whole calendar, themed.

import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayLayer } from '../../../hooks/useOverlayLayer'

/**
 * The calendar arrives with the first open, not with the field: a filter rail
 * of date fields should not ship react-datepicker to someone who only ever
 * types. Vite splits this into its own chunk.
 */
export const LazyDatePicker = lazy(() =>
  import('../../date-picker/date-picker').then((m) => ({ default: m.DatePicker })),
)

const GAP = 6
const EDGE = 8

/** Focus the calendar's roving day once it has mounted — after the lazy chunk. */
function FocusDay({ root }: { root: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const el = root.current
    const target =
      el?.querySelector<HTMLElement>('.react-datepicker__day[tabindex="0"]') ??
      el?.querySelector<HTMLElement>('button:not(:disabled)')
    target?.focus()
  }, [root])
  return null
}

export function DatePopover({
  anchor,
  open,
  label,
  onClose,
  aside,
  children,
}: {
  /** The field's shell: the popover aligns to it and treats it as "inside". */
  anchor: HTMLElement | null
  open: boolean
  label: string
  /** `refocus` is true when the close came from the keyboard. */
  onClose: (refocus: boolean) => void
  /** Quick picks, beside the calendar. */
  aside?: ReactNode
  children: ReactNode
}) {
  const layer = useOverlayLayer(anchor)
  const ref = useRef<HTMLDivElement>(null)

  // Below the field, left-aligned; above only when below is genuinely worse.
  const place = useRef(() => {})
  place.current = () => {
    const el = ref.current
    if (!el || !anchor || !layer) return
    const frame = layer.getBoundingClientRect()
    const a = anchor.getBoundingClientRect()
    const width = el.offsetWidth
    const height = el.offsetHeight
    const below = window.innerHeight - a.bottom - GAP - EDGE
    const above = a.top - GAP - EDGE
    const y = height <= below || below >= above ? a.bottom + GAP : a.top - GAP - height
    const x = Math.min(Math.max(a.left, EDGE), window.innerWidth - EDGE - width)
    el.style.transform = `translate3d(${Math.round(x - frame.left)}px, ${Math.round(y - frame.top)}px, 0)`
    el.style.opacity = '1'
  }

  useLayoutEffect(() => {
    if (open) place.current()
  })

  // The field moves without telling anyone — a panel scrolls, a list above it
  // grows — so follow it while open, one measurement per frame.
  useEffect(() => {
    if (!open || !anchor) return
    let raf = 0
    let last = ''
    const tick = () => {
      const r = anchor.getBoundingClientRect()
      const el = ref.current
      const key = `${r.top}|${r.left}|${el?.offsetHeight}|${window.innerWidth}|${window.innerHeight}`
      if (key !== last) {
        last = key
        place.current()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, anchor])

  // A press anywhere else closes it. composedPath, so a field inside the
  // widget's shadow root still recognises its own popover.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath()
      if (ref.current && path.includes(ref.current)) return
      if (anchor && path.includes(anchor)) return
      onClose(false)
    }
    const doc = anchor?.ownerDocument ?? document
    doc.addEventListener('pointerdown', onPointerDown, true)
    return () => doc.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, anchor, onClose])

  if (!open || !layer) return null

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      className="pointer-events-auto absolute top-0 left-0 flex max-w-[calc(100vw-16px)] max-sm:flex-col overflow-hidden rounded-surface border border-line bg-panel-solid shadow-xl shadow-(color:--shadow-menu)"
      // Hidden with opacity, not `visibility`, until it has been placed. The
      // calendar is focused in the same tick it is revealed, and a
      // `visibility: hidden` element cannot take focus. Under reduced motion
      // the global rule that collapses every transition to 0.01ms makes each
      // day cell *transition* out of hidden, so for that first instant the
      // focus call failed: focus stayed on the trigger, where Escape is not
      // handled, and the calendar could not be closed from the keyboard.
      style={{ opacity: 0 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose(true)
        }
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null
        if (!next) return
        if (ref.current?.contains(next) || anchor?.contains(next)) return
        onClose(false)
      }}
    >
      {aside}
      <Suspense
        fallback={<div aria-hidden="true" className="h-[22rem] w-80 animate-pulse bg-tint/4" />}
      >
        {children}
        <FocusDay root={ref} />
      </Suspense>
    </div>,
    layer,
  )
}

/** The quick-pick column beside the calendar — a wrapping row above it on phones. */
export function PresetList<T>({
  presets,
  label = 'Quick picks',
  active,
  onPick,
}: {
  label?: string
  presets: { label: string; value: T }[]
  active: string | undefined
  onPick: (value: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-line bg-tint/3 p-2.5 max-sm:w-auto max-sm:flex-row max-sm:flex-wrap max-sm:border-r-0 max-sm:border-b"
    >
      <span className="px-2 pt-1 pb-1.5 text-[11px] max-sm:w-full font-extrabold tracking-[0.08em] text-ink-soft uppercase">
        {label}
      </span>
      {presets.map((preset) => {
        const on = preset.label === active
        return (
          <button
            key={preset.label}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(preset.value)}
            className={`rounded-control px-2.5 py-1.5 text-left text-[13px] transition-colors ${
              on
                ? 'bg-panel-solid font-extrabold text-chip-fg shadow-sm shadow-(color:--shadow-soft)'
                : 'text-ink hover:bg-tint/6'
            }`}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
