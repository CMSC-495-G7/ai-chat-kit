import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Space around the pages and between them, in px. Zoom doesn't scale it.
const GUTTER = 16
// Pages drawn past the visible ones on each side, so a scroll doesn't outrun the drawing.
const OVERSCAN = 1
// A drag-resize reports a new width every frame, and every new width redraws
// every visible page — so wait for it to settle.
const SETTLE_MS = 120

/** The scroll box's size, once it has stopped changing. */
function useSettledBox(scroller: HTMLElement) {
  const [box, setBox] = useState({ width: scroller.clientWidth, height: scroller.clientHeight })
  useEffect(() => {
    let timer: number | undefined
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const { clientWidth: width, clientHeight: height } = scroller
        setBox((was) => (was.width === width && was.height === height ? was : { width, height }))
      }, SETTLE_MS)
    })
    observer.observe(scroller)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [scroller])
  return box
}

type PageColumnProps = {
  /** The element that scrolls the column; pages are sized from its box. */
  scroller: HTMLElement
  zoom: number
  pages: number
  /** A page's height over its width. Every page is assumed to share it. */
  ratio: number
  /** Shown while the scroll box has no width to size a page from. */
  pending: ReactNode
  onPageChange: (page: number) => void
  /** Draws one page, 1-based, to fill a sheet of this size in px. */
  children: (page: number, width: number, height: number) => ReactNode
}

/**
 * The layout the fixed-page formats share: a column of sheets, fitted to the
 * scroll box's width and multiplied by `zoom`. Only the pages in view (plus
 * one each side) are drawn; the rest are blank sheets of the right size, so a
 * long document costs what a short one does and the scrollbar is honest from
 * the start.
 */
export function PageColumn({
  scroller,
  zoom,
  pages,
  ratio,
  pending,
  onPageChange,
  children,
}: PageColumnProps) {
  const box = useSettledBox(scroller)

  const pageWidth = Math.max(0, Math.round((box.width - GUTTER * 2) * zoom))
  const pageHeight = Math.round(pageWidth * ratio)
  // One page plus the gap beneath it: the unit all the scroll arithmetic is in.
  const stride = pageHeight + GUTTER

  const [view, setView] = useState({ first: 1, last: 1, current: 1 })
  // Where the reader is, in pages rather than px, so a zoom or a resize can put
  // them back on the same spot of the same page.
  const place = useRef(0)

  useLayoutEffect(() => {
    if (pageWidth) scroller.scrollTop = place.current * stride
  }, [scroller, pageWidth, stride])

  useEffect(() => {
    if (!pageWidth) return
    const pageAt = (y: number) =>
      Math.min(pages, Math.max(1, Math.floor((y - GUTTER) / stride) + 1))
    const read = () => {
      const top = scroller.scrollTop
      place.current = top / stride
      const next = {
        first: pageAt(top),
        last: pageAt(top + box.height),
        current: pageAt(top + box.height / 2),
      }
      setView((was) =>
        was.first === next.first && was.last === next.last && was.current === next.current
          ? was
          : next,
      )
    }
    read()
    scroller.addEventListener('scroll', read, { passive: true })
    return () => scroller.removeEventListener('scroll', read)
  }, [scroller, pages, pageWidth, stride, box.height])

  const { current } = view
  useEffect(() => {
    onPageChange(current)
  }, [current, onPageChange])

  if (!pageWidth) return pending

  return (
    <div
      className="flex w-max min-w-full flex-col items-center"
      style={{ padding: GUTTER, gap: GUTTER }}
    >
      {Array.from({ length: pages }, (_, index) => {
        const page = index + 1
        const drawn = page >= view.first - OVERSCAN && page <= view.last + OVERSCAN
        return (
          <div
            key={page}
            className="bg-white shadow-sm ring-1 ring-line"
            style={{ width: pageWidth, minHeight: pageHeight }}
          >
            {drawn && children(page, pageWidth, pageHeight)}
          </div>
        )
      })}
    </div>
  )
}
