import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useOverlayLayer } from '../../hooks/useOverlayLayer'
import type { TooltipProps } from './types'

const GAP = 7
const EDGE = 8

/**
 * Supplementary text for an already-labelled control.
 *
 * The bubble is portalled into the shared overlay layer so clipping and local
 * stacking contexts cannot hide it. `resolveOverlayParent` keeps that layer in
 * the active native dialog or shadow root when document.body would be the
 * wrong top-level surface.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  disabled = false,
  delay = 350,
}: TooltipProps) {
  const id = useId()
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const layer = useOverlayLayer(anchor, 'tooltip')

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  const close = useCallback(() => {
    clearTimer()
    setOpen(false)
  }, [])
  const openAfter = (ms: number) => {
    clearTimer()
    if (disabled) return
    timer.current = setTimeout(() => setOpen(true), ms)
  }

  const place = useRef(() => {})
  place.current = () => {
    const tooltip = tooltipRef.current
    if (!anchor || !tooltip || !layer) return

    const layerRect = layer.getBoundingClientRect()
    const scale = layer.offsetWidth ? layerRect.width / layer.offsetWidth : 1
    const local = (value: number, origin: number) => (value - origin) / scale
    const viewLeft = local(Math.max(layerRect.left, 0), layerRect.left)
    const viewTop = local(Math.max(layerRect.top, 0), layerRect.top)
    const viewRight = local(Math.min(layerRect.right, window.innerWidth), layerRect.left)
    const viewBottom = local(Math.min(layerRect.bottom, window.innerHeight), layerRect.top)
    const availableWidth = Math.max(120, viewRight - viewLeft - EDGE * 2)

    tooltip.style.maxWidth = `${Math.min(256, availableWidth)}px`
    const width = tooltip.offsetWidth
    const height = tooltip.offsetHeight
    const rect = anchor.getBoundingClientRect()
    const top = local(rect.top, layerRect.top)
    const bottom = local(rect.bottom, layerRect.top)
    const centre = local(rect.left + rect.width / 2, layerRect.left)
    const fitsTop = top - GAP - height >= viewTop + EDGE
    const fitsBottom = bottom + GAP + height <= viewBottom - EDGE
    const above = placement === 'top' ? fitsTop || !fitsBottom : !fitsBottom && fitsTop
    const x = Math.min(Math.max(centre - width / 2, viewLeft + EDGE), viewRight - EDGE - width)
    const y = above ? top - GAP - height : bottom + GAP

    tooltip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
    tooltip.style.visibility = 'visible'
  }

  useLayoutEffect(() => {
    if (!open || !layer) return
    place.current()
  }, [content, layer, open, placement])

  // Follow scrolling, resizing, layout growth and transformed hosts. A shared
  // overlay may live outside the scroller, so no single scroll listener can
  // observe every movement that changes the trigger's viewport rectangle.
  useEffect(() => {
    if (!open || !layer) return
    let frame = 0
    let last = ''
    const tick = () => {
      const tooltip = tooltipRef.current
      if (anchor && tooltip) {
        const a = anchor.getBoundingClientRect()
        const key = `${a.top}|${a.left}|${a.width}|${tooltip.offsetWidth}|${tooltip.offsetHeight}|${window.innerWidth}|${window.innerHeight}`
        if (key !== last) {
          last = key
          place.current()
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [anchor, open, layer])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      close()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [close, open])

  useEffect(() => {
    if (disabled) close()
  }, [close, disabled])

  useEffect(() => clearTimer, [])

  const describedBy = [children.props['aria-describedby'], open ? id : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      ref={setAnchor}
      className="inline-flex shrink-0"
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return
        openAfter(delay)
      }}
      onPointerLeave={close}
      onPointerDown={close}
      onFocusCapture={(event) => {
        if (!(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible'))
          return
        openAfter(0)
      }}
      onBlurCapture={close}
    >
      {cloneElement(children, { 'aria-describedby': describedBy || undefined })}
      {open && layer
        ? createPortal(
            <div
              ref={tooltipRef}
              id={id}
              role="tooltip"
              style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden' }}
              className="pointer-events-none z-10 rounded-control border border-line bg-panel-solid px-2 py-1.5 text-[11.5px] leading-snug font-semibold text-ink shadow-lg shadow-(color:--shadow-menu)"
            >
              {content}
            </div>,
            layer,
          )
        : null}
    </span>
  )
}
