// A card anchored to an element, portalled out of whatever is clipping it.
//
// Generic on purpose: it knows about a rectangle to point at and a box to keep
// on screen, and nothing about citations. That is also the piece an app with
// its own portal container adopts — it only has to supply the container
// (OverlayContainerProvider) and this keeps working.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayLayer } from '../../hooks/useOverlayLayer'
import type { HoverCardProps } from './types'

/** Distance from the anchor. Rendered as padding on the card's wrapper rather
 *  than as empty space, so the pointer crossing it is still on the card — the
 *  only way a portalled card can be hoverable, since it cannot share a CSS
 *  bridge with an anchor in another tree. */
const GAP = 8
/** Keep-clear margin at the viewport edges. */
const EDGE = 8

export function HoverCard({
  anchor,
  open,
  maxWidth = 360,
  maxHeight = 320,
  onPointerEnter,
  onPointerLeave,
  children,
}: HoverCardProps) {
  const layer = useOverlayLayer(anchor)
  const cardRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  // Placement writes styles straight to the node. It runs once before paint and
  // then once per frame while open (below), so routing it through state would
  // re-render the card sixty times a second for a position that React has no
  // opinion about.
  const place = useRef(() => {})
  place.current = () => {
    const el = cardRef.current
    if (!el || !anchor || !layer) return

    const layerRect = layer.getBoundingClientRect()
    // offsetWidth is the untransformed layout width; the rect is the
    // transformed one, so their ratio is the combined scale of every
    // transformed ancestor. It is exactly 1 when the layer really is anchored
    // to the viewport — which is the intent — and correcting for it anyway is
    // what lets this component survive a host that portals it somewhere
    // transformed.
    const scale = layer.offsetWidth ? layerRect.width / layer.offsetWidth : 1
    const local = (v: number, origin: number) => (v - origin) / scale

    const a = anchor.getBoundingClientRect()
    const top = local(a.top, layerRect.top)
    const bottom = local(a.bottom, layerRect.top)
    const centre = local(a.left + a.width / 2, layerRect.left)

    // The visible viewport in the layer's own coordinates. When a transformed
    // ancestor did capture the layer, this is the intersection of that
    // ancestor's box with the screen — precisely the region to stay inside.
    const view = {
      left: local(Math.max(layerRect.left, 0), layerRect.left),
      top: local(Math.max(layerRect.top, 0), layerRect.top),
      right: local(Math.min(layerRect.right, window.innerWidth), layerRect.left),
      bottom: local(Math.min(layerRect.bottom, window.innerHeight), layerRect.top),
    }

    const width = Math.min(maxWidth, view.right - view.left - 2 * EDGE)
    el.style.width = `${width}px`

    // Above by default: the anchor sits in running prose, and a card below it
    // covers the sentence the reader is in the middle of. Flip only when the
    // space below is genuinely better.
    const spaceAbove = top - view.top - GAP - EDGE
    const spaceBelow = view.bottom - bottom - GAP - EDGE

    // Measure at the roomier of the two caps first: the side is chosen by
    // whether the card *actually* fits above, not by whether its worst-case
    // height would. A 150px card next to a 250px gap belongs above even when
    // there happens to be 300px below it.
    const cap = (space: number) => Math.max(80, Math.min(maxHeight, space))
    el.style.setProperty('--hover-card-max-h', `${cap(Math.max(spaceAbove, spaceBelow))}px`)
    const natural = el.offsetHeight
    const above = natural <= spaceAbove || spaceAbove >= spaceBelow

    el.style.setProperty('--hover-card-max-h', `${cap(above ? spaceAbove : spaceBelow)}px`)
    const height = el.offsetHeight
    const y = above ? top - GAP - height : bottom + GAP
    const x = Math.min(Math.max(centre - width / 2, view.left + EDGE), view.right - EDGE - width)

    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
    el.style.visibility = 'visible'
  }

  // Before paint, so the card is never seen at 0,0.
  useLayoutEffect(() => {
    if (!open || !layer || !anchor) {
      setShown(false)
      return
    }
    place.current()
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [open, layer, anchor])

  // The anchor moves for three reasons and only one of them fires an event:
  // the page or transcript scrolls, the viewport resizes, or a streaming
  // message above the chip grows a line and pushes it down — which emits
  // nothing at all. `scroll` also neither bubbles nor crosses shadow
  // boundaries, so a window-level capture listener cannot see the widget's own
  // transcript scrolling. A card is only open while a pointer rests on its
  // anchor, so one measurement per frame is both cheaper and more correct than
  // the listeners it replaces.
  useEffect(() => {
    if (!open || !layer || !anchor) return
    let raf = 0
    let last = ''
    const tick = () => {
      const r = anchor.getBoundingClientRect()
      const key = `${r.top}|${r.left}|${window.innerWidth}|${window.innerHeight}`
      if (key !== last) {
        last = key
        place.current()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, layer, anchor])

  if (!open || !layer) return null

  return createPortal(
    <div
      ref={cardRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      // Positioned inside a layer that is itself `fixed inset-0`, and moved
      // with a transform rather than top/left so a reposition never triggers
      // layout. Hidden until the first measurement lands.
      style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden' }}
      // The padding IS the gap to the anchor — see GAP.
      className="pointer-events-auto px-1 py-2"
    >
      <div
        className={`transition-[opacity,translate] duration-150 ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>,
    layer,
  )
}
