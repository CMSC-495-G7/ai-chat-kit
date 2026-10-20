import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Source } from '../../engine/types'
import type { ReferenceOriginalProps } from './types'

// The Original view's zoom, as a multiple of "fit the width".
const ZOOM = { min: 0.5, max: 3, step: 0.25 }

export type OriginalView = {
  /** The host's drawing of the source's original; null when it has none. */
  node: ReactNode
  zoom: number
  /** The file has opened: there is something to zoom, and perhaps pages to count. */
  ready: boolean
  /** "Page 3 of 14", once the file has said how long it is. */
  pageLabel?: string
  canZoomIn: boolean
  canZoomOut: boolean
  zoomIn: () => void
  zoomOut: () => void
}

/**
 * One showing of a source's original: its zoom, and what the open file has
 * reported. The panel has one and the pop-out dialog has another, so zooming
 * the dialog leaves the panel as it was.
 *
 * Zoom and the file's report belong to one source — 150% of a fitted PDF page
 * is not 150% of a reflowed Word file — so each carries that source's id, and
 * a new reference starts without them.
 */
export function useOriginalView(
  source: Source,
  renderOriginal: ((props: ReferenceOriginalProps) => ReactNode) | undefined,
): OriginalView {
  const [zoomed, setZoomed] = useState<{ id: number; zoom: number } | null>(null)
  const zoom = zoomed?.id === source.id ? zoomed.zoom : 1
  // Null until the file opens, and again if it fails: there is nothing to zoom
  // or count pages of until then.
  const [opened, setOpened] = useState<{ id: number; page: number; count?: number } | null>(null)
  const node =
    renderOriginal?.({
      source,
      zoom,
      onLoad: ({ pageCount }) => setOpened({ id: source.id, page: 1, count: pageCount }),
      onPageChange: (page) => setOpened((was) => (was?.id === source.id ? { ...was, page } : was)),
      onError: () => setOpened(null),
    }) || null
  const ready = opened?.id === source.id
  const step = (by: number) =>
    setZoomed({ id: source.id, zoom: Math.min(ZOOM.max, Math.max(ZOOM.min, zoom + by)) })

  return {
    node,
    zoom,
    ready,
    pageLabel: ready && opened.count ? `Page ${opened.page} of ${opened.count}` : undefined,
    canZoomIn: ready && zoom < ZOOM.max,
    canZoomOut: ready && zoom > ZOOM.min,
    zoomIn: () => step(ZOOM.step),
    zoomOut: () => step(-ZOOM.step),
  }
}
