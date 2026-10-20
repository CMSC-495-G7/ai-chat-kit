import { withDefaults } from '../../lib/withDefaults'
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  DocumentKind,
  DocumentLoadInfo,
  DocumentPreviewProps,
  DocumentSource,
  DocumentPreviewLabels,
} from './types'

// One renderer per format, and each is the only file that imports its library,
// so no library is fetched until a document of that kind is first opened.
// Adding a format is one line here plus one file beside this one.
const renderers = {
  pdf: lazy(() => import('./pdf-document')),
  docx: lazy(() => import('./docx-document')),
  pptx: lazy(() => import('./pptx-document')),
}

type Load = {
  src: DocumentSource
  kind: DocumentKind
  run: number
  failed: boolean
  error?: unknown
}

/**
 * A PDF, Word or PowerPoint file, drawn in place. This is the whole public surface: give
 * it a file and a kind, and it owns fetching, the loading sheet and the
 * failure message. It scrolls itself, so it wants a parent with a height.
 *
 * Nothing here knows about chat, sources or the reference panel — the folder
 * imports only React and its three libraries, so it can be lifted out whole.
 */
export function DocumentPreview({
  src,
  kind,
  zoom = 1,
  title,
  onLoad,
  onPageChange,
  onError,
  renderError,
  renderLoading,
  labels: overrides,
  className = '',
}: DocumentPreviewProps) {
  const labels: DocumentPreviewLabels = withDefaults<DocumentPreviewLabels>(
    {
      region: (title) => (title ? `Original document: ${title}` : 'Original document'),
      loading: 'Loading the original document',
      failedTitle: 'Can’t preview this document here',
      failedBody: (url) =>
        `The original didn’t load.${url ? ' You can still open it in a new tab.' : ''}`,
      openOriginal: 'Open original',
      retry: 'Try again',
    },
    overrides,
  )
  // One load is one file, one try. The failure lives in the same object as the
  // file it belongs to, so a new file starts clean without an effect to reset
  // it, and bumping `run` remounts the renderer for a retry.
  const [load, setLoad] = useState<Load>({ src, kind, run: 0, failed: false })
  if (load.src !== src || load.kind !== kind) {
    setLoad({ src, kind, run: load.run + 1, failed: false })
  }

  // The renderers list these as effect dependencies, so they must keep their
  // identity when the host re-renders with fresh inline handlers.
  const host = useRef({ onLoad, onPageChange, onError })
  useEffect(() => {
    host.current = { onLoad, onPageChange, onError }
  })
  const loaded = useCallback((info: DocumentLoadInfo) => host.current.onLoad?.(info), [])
  const paged = useCallback((page: number) => host.current.onPageChange?.(page), [])
  const failed = useCallback((error: unknown) => {
    setLoad((was) => ({ ...was, failed: true, error }))
    host.current.onError?.(error)
  }, [])
  const retry = () => setLoad((was) => ({ ...was, run: was.run + 1, failed: false }))

  // State rather than a ref: the renderers size pages from this element's box
  // and read its scroll position, so they need the element, not a handle.
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const Renderer = renderers[kind]
  const pending = renderLoading?.() ?? <Pending label={labels.loading} />

  return (
    <div
      ref={setScroller}
      role="group"
      aria-label={labels.region(title)}
      // A scroll box with nothing focusable inside is out of a keyboard's reach.
      tabIndex={0}
      // The gutter is reserved so a scrollbar appearing can't narrow the box,
      // shrink the page, and make itself disappear again.
      className={`flex min-h-0 flex-1 flex-col overflow-auto [scrollbar-gutter:stable] focus-visible:-outline-offset-2 ${
        load.failed ? '' : 'bg-code-block'
      } ${className}`}
    >
      {load.failed
        ? (renderError?.({ error: load.error, retry }) ?? (
            <Failed src={src} retry={retry} labels={labels} />
          ))
        : scroller && (
            <Boundary key={load.run} onError={failed}>
              <Suspense fallback={pending}>
                <Renderer
                  src={src}
                  zoom={zoom}
                  scroller={scroller}
                  pending={pending}
                  onLoad={loaded}
                  onPageChange={paged}
                  onError={failed}
                />
              </Suspense>
            </Boundary>
          )}
    </div>
  )
}

/**
 * A renderer that throws — or whose chunk fails to download — is the same
 * failure to the reader as a file that won't open, so it takes the same path.
 */
class Boundary extends Component<
  { onError: (error: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** A blank sheet where the first page will land, so the document doesn't pop in from nothing. */
function Pending({ label }: { label: string }) {
  return (
    <div role="status" className="p-4">
      <span className="sr-only">{label}</span>
      <div
        aria-hidden
        className="flex aspect-[17/22] animate-pulse flex-col gap-2.5 bg-white px-[11%] py-[9%] shadow-sm ring-1 ring-line"
      >
        <span className="mb-3 h-3.5 w-2/5 rounded-sm bg-black/10" />
        <span className="h-2 rounded-sm bg-black/6" />
        <span className="h-2 rounded-sm bg-black/6" />
        <span className="h-2 w-3/4 rounded-sm bg-black/6" />
        <span className="mt-4 mb-1 h-2.5 w-1/3 rounded-sm bg-black/10" />
        <span className="h-2 rounded-sm bg-black/6" />
        <span className="h-2 w-3/5 rounded-sm bg-black/6" />
      </div>
    </div>
  )
}

/** The fallback when a file can't be drawn: say so, and leave a way to the file itself. */
function Failed({
  src,
  retry,
  labels,
}: {
  src: DocumentSource
  retry: () => void
  labels: DocumentPreviewLabels
}) {
  const url = typeof src === 'string' ? src : undefined
  return (
    <div
      role="alert"
      className="m-auto flex max-w-xs flex-col items-center gap-4 px-6 py-10 text-center"
    >
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-surface bg-chip text-chip-fg"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M12 12v4M12 19h.01" />
        </svg>
      </span>
      <div>
        <p className="text-[15px] font-semibold text-ink-strong">{labels.failedTitle}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{labels.failedBody(!!url)}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center rounded-control bg-brand-solid px-3.5 text-[13px] font-semibold text-on-brand-solid transition hover:brightness-95"
          >
            {labels.openOriginal}
          </a>
        )}
        <button
          type="button"
          onClick={retry}
          className="min-h-9 rounded-control border border-line bg-panel-solid px-3.5 text-[13px] font-semibold text-ink-strong transition hover:bg-tint/6"
        >
          {labels.retry}
        </button>
      </div>
    </div>
  )
}
