import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayLayer } from '../../hooks/useOverlayLayer'
import type { PopoverProps } from './types'

const GAP = 6
const EDGE = 8

/**
 * A panel anchored to a control: the tenant list, the pinned-pages manager,
 * the account menu, a collapsed menu item's sub-sections.
 *
 * Portalled into the overlay layer for the reason lib/overlay.ts gives —
 * a panel positioned inside a clipped or filtered ancestor loses whatever
 * falls outside that ancestor's box — and placed with fixed coordinates
 * measured from the anchor, re-measured on resize. Closes on Escape and on a
 * press anywhere outside both the panel and its anchor.
 */
export function Popover({
  anchor,
  open,
  onClose,
  label,
  width,
  align = 'start',
  role = 'dialog',
  className = '',
  children,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Resolved only while open, so the layer re-reads the theme classes each time.
  const layer = useOverlayLayer(open ? anchor : null)
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchor) return
    const place = () => {
      const r = anchor.getBoundingClientRect()
      const max = window.innerWidth - width - EDGE
      if (align === 'side') {
        setPos({ left: Math.min(r.right + GAP, max), top: r.top })
        return
      }
      if (align === 'above') {
        setPos({
          left: Math.max(EDGE, Math.min(r.left, max)),
          bottom: window.innerHeight - r.top + GAP,
        })
        return
      }
      const left = align === 'end' ? r.right - width : r.left
      setPos({ left: Math.max(EDGE, Math.min(left, max)), top: r.bottom + GAP })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open, anchor, width, align])

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      const path = event.composedPath()
      if (anchor && path.includes(anchor)) return
      if (panelRef.current && path.includes(panelRef.current)) return
      onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onClose()
      anchor?.focus()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, anchor, onClose])

  if (!open || !layer) return null

  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-label={label}
      style={{
        position: 'fixed',
        left: pos?.left ?? 0,
        top: pos?.bottom === undefined ? (pos?.top ?? 0) : undefined,
        bottom: pos?.bottom,
        width,
        pointerEvents: 'auto',
        // Nothing to show until the first measurement lands.
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={`flex max-h-[calc(100dvh-5rem)] flex-col overflow-y-auto rounded-surface border border-line bg-panel-solid p-2 text-ink shadow-xl shadow-(color:--shadow-menu) ${className}`}
    >
      {children}
    </div>,
    layer,
  )
}
