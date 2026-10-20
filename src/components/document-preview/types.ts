import type { ReactNode } from 'react'

/** The file formats the preview can draw. */
export type DocumentKind = 'pdf' | 'docx' | 'pptx'

/** The file itself: a URL the browser can fetch, or the bytes. */
export type DocumentSource = string | Blob | ArrayBuffer

/** What is known once a file has opened. */
export type DocumentLoadInfo = {
  /**
   * Pages of a PDF, slides of a deck. A Word file has none: it is reflowed to
   * the container and has no fixed pages.
   */
  pageCount?: number
}

export type DocumentPreviewLabels = {
  region: (title: string | undefined) => string
  loading: string
  failedTitle: string
  failedBody: (hasUrl: boolean) => string
  openOriginal: string
  retry: string
}

export type DocumentPreviewProps = {
  labels?: Partial<DocumentPreviewLabels>
  renderLoading?: () => ReactNode
  src: DocumentSource
  kind: DocumentKind
  /** 1 fits the container's width. The host owns the controls that change it. */
  zoom?: number
  /** Names the scroll region for assistive tech — usually the document's title. */
  title?: string
  onLoad?: (info: DocumentLoadInfo) => void
  /** The page or slide at the middle of the view, 1-based. PDFs and decks. */
  onPageChange?: (page: number) => void
  onError?: (error: unknown) => void
  /** Replaces the built-in failure message. `retry` loads the file again. */
  renderError?: (failure: { error: unknown; retry: () => void }) => ReactNode
  className?: string
}

/**
 * What the wrapper hands a renderer — the whole contract a new format has to
 * meet. Every callback here is stable, so a renderer can list them as effect
 * dependencies.
 */
export type DocumentRendererProps = {
  src: DocumentSource
  zoom: number
  /** The element that scrolls the document; pages are sized from its box. */
  scroller: HTMLElement
  /** Shown until the file has opened. */
  pending: ReactNode
  onLoad: (info: DocumentLoadInfo) => void
  onPageChange: (page: number) => void
  onError: (error: unknown) => void
}
