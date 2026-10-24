import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'

type Options = {
  initial: number
  min: number
  max: number
  /** When set, the width is read from and written to localStorage. */
  storageKey?: string
  /** How far one arrow-key press moves the edge. */
  step?: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

/**
 * A panel's width, changed by dragging its right edge or by the arrow keys
 * while that edge has focus.
 *
 * useResizablePanel covers the drag for a panel whose handle is on its left;
 * this is the mirror, for a left-hand panel, and adds the keyboard — a
 * splitter that only a mouse can move is not one a keyboard user can use.
 */
export function useResizableWidth({ initial, min, max, storageKey, step = 16 }: Options) {
  const [width, setWidth] = useState(() => {
    const stored = storageKey ? Number(localStorage.getItem(storageKey)) : Number.NaN
    return clamp(Number.isFinite(stored) && stored > 0 ? stored : initial, min, max)
  })
  const [dragging, setDragging] = useState(false)
  const widthRef = useRef(width)
  widthRef.current = width

  useEffect(() => {
    if (storageKey && !dragging) localStorage.setItem(storageKey, String(width))
  }, [storageKey, dragging, width])

  /** `left` is the panel's own left edge, in viewport pixels. */
  const onPointerDown = useCallback(
    (event: PointerEvent, left: number) => {
      event.preventDefault()
      setDragging(true)
      const cursor = document.body.style.cursor
      const select = document.body.style.userSelect
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (move: globalThis.PointerEvent) =>
        setWidth(clamp(move.clientX - left, min, max))
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        document.body.style.cursor = cursor
        document.body.style.userSelect = select
        setDragging(false)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [min, max],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const next =
        event.key === 'ArrowLeft'
          ? widthRef.current - step
          : event.key === 'ArrowRight'
            ? widthRef.current + step
            : event.key === 'Home'
              ? min
              : event.key === 'End'
                ? max
                : null
      if (next === null) return
      event.preventDefault()
      setWidth(clamp(next, min, max))
    },
    [min, max, step],
  )

  const reset = useCallback(() => setWidth(clamp(initial, min, max)), [initial, min, max])

  return { width, dragging, onPointerDown, onKeyDown, reset }
}
