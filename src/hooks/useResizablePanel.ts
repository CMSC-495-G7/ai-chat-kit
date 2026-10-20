import { useCallback, useRef, useState } from 'react'

type UseResizablePanelOptions = {
  /** Starting width in px (also the fallback when nothing is stored). */
  initial: number
  /** When set, the width is hydrated from and persisted to localStorage. */
  storageKey?: string
}

/**
 * Owns a panel's width and the pointer-drag lifecycle for a resize handle.
 * The caller supplies `computeWidth(clientX)` on drag start — it measures its
 * own container and clamps to whatever min/max it wants, so this hook stays
 * layout-agnostic and reusable across the demo panel and the widget split.
 *
 * Works inside the widget's shadow root: pointer events bubble to `window`
 * with viewport-relative `clientX`, matching the `getBoundingClientRect()`
 * the caller reads.
 */
export function useResizablePanel({ initial, storageKey }: UseResizablePanelOptions) {
  const [width, setWidth] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(stored) && stored > 0) return stored
    }
    return initial
  })
  const [dragging, setDragging] = useState(false)

  // Keep the latest width in a ref so the pointerup handler can persist it
  // without being re-created every render.
  const widthRef = useRef(width)
  widthRef.current = width

  const startResize = useCallback(
    (e: React.PointerEvent, computeWidth: (clientX: number) => number) => {
      e.preventDefault()
      setDragging(true)

      const prevCursor = document.body.style.cursor
      const prevSelect = document.body.style.userSelect
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (ev: PointerEvent) => setWidth(computeWidth(ev.clientX))
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        document.body.style.cursor = prevCursor
        document.body.style.userSelect = prevSelect
        setDragging(false)
        if (storageKey && typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, String(widthRef.current))
        }
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [storageKey],
  )

  return { width, dragging, startResize }
}
