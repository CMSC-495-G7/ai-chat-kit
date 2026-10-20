import type { ReactNode } from 'react'
import type { Highlight, Source } from '../../engine/types'

/** What the panel hands a host that can draw a source's original file. */
export type ReferenceOriginalProps = {
  source: Source
  /** 1 fits the panel's width; the panel's own buttons change it. */
  zoom: number
  /** The file has opened. With a page count, the panel can show "Page 3 of 14". */
  onLoad: (info: { pageCount?: number }) => void
  onPageChange: (page: number) => void
  /** The file can't be shown; the panel stands its zoom controls down. */
  onError: () => void
}

export type ReferencePanelProps = {
  sources: Source[]
  activeId: number
  onSelect: (id: number) => void
  onClose: () => void
  /** Supporting passages to highlight, keyed by source id (referenceNumber). */
  highlights?: Highlight[]
  /** When set (mobile widget slide-over), the close control becomes a back button. */
  backLabel?: string
  /**
   * Draws a source's original file in place of the excerpt. Given one, the
   * panel offers an Excerpt / Original switch on every source it returns
   * something for; return null for a source with nothing to show. Passed in
   * rather than imported so a host that never shows originals — the widget —
   * doesn't carry the renderers.
   */
  renderOriginal?: (props: ReferenceOriginalProps) => ReactNode
  /**
   * Adds a pop-out button beside the Excerpt / Original switch. It opens the
   * original in a dialog, which can be expanded to most of the window, with a
   * zoom of its own. Needs `renderOriginal`, and shows only on a source that
   * has an original.
   */
  popOut?: boolean
}
