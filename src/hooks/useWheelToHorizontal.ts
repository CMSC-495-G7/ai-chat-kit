// Lets a wheel mouse scroll a horizontally-overflowing strip.
//
// A trackpad can swipe sideways and already emits deltaX; an ordinary mouse
// emits deltaY only, so an `overflow-x-auto` rail is unreachable with one — you
// can see the overflow and not get to it.
//
// Why a native listener rather than a JSX `onWheel`: React registers `wheel` as
// a *passive* listener on its root container, so `preventDefault()` inside a
// synthetic handler is ignored (and warns). Cancelling the default scroll is
// the whole job here, so the listener has to be attached itself, with
// `{ passive: false }`.

import { useEffect, type RefObject } from 'react'

/** Translate vertical wheel deltas into horizontal scrolling on `ref`. */
export function useWheelToHorizontal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // A trackpad's own sideways gesture is already right — leave it alone.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      // Nothing to scroll; don't swallow the page's gesture.
      if (el.scrollWidth <= el.clientWidth) return

      // At either end, let the event through so the gesture continues into the
      // page instead of dying on a rail that can't move. The 1px slack absorbs
      // the fractional scrollLeft a zoomed or fractional-DPR layout produces.
      const max = el.scrollWidth - el.clientWidth
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return

      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [ref])
}
