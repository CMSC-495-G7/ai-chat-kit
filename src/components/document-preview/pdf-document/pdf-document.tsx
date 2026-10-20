import { useMemo, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { PageColumn } from '../page-column'
import type { DocumentRendererProps } from '../types'

// pdf.js parses off the main thread and wants its worker as a URL. This is the
// one bundler-specific line in the folder: Vite turns it into an emitted file.
// pdfjs-dist arrives with react-pdf; under a strict installer (pnpm) it has to
// be a direct dependency too, at the version react-pdf pins.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/** `ratio` is the first page's height over its width; the rest are assumed to match. */
type Sheets = { pages: number; ratio: number }

/**
 * A PDF as a column of pages, fitted to the scroll box's width and multiplied
 * by `zoom`. Only the pages in view (plus one each side) hold a canvas — see
 * PageColumn.
 */
export default function PdfDocument({
  src,
  zoom,
  scroller,
  pending,
  onLoad,
  onPageChange,
  onError,
}: DocumentRendererProps) {
  // pdf.js hands a buffer to its worker and leaves the caller's copy detached,
  // so it gets its own. Memoised because a new `file` object reloads the document.
  const file = useMemo(
    () => (src instanceof ArrayBuffer ? { data: new Uint8Array(src.slice(0)) } : src),
    [src],
  )
  const [sheets, setSheets] = useState<Sheets | null>(null)

  return (
    <Document
      file={file}
      // react-pdf suspends by default, and the nearest boundary is the wrapper's,
      // above this component. Suspending there throws away `file`, so bytes look
      // like a new document on every retry and never load; and each page that
      // scrolls in would blank the whole document. Pages inherit this.
      suspense={false}
      loading={pending}
      noData={pending}
      // A failed load is reported up; the wrapper replaces this whole tree.
      error={null}
      externalLinkTarget="_blank"
      onLoadError={onError}
      onLoadSuccess={(pdf) => {
        pdf.getPage(1).then((page) => {
          const { width, height } = page.getViewport({ scale: 1 })
          setSheets({ pages: pdf.numPages, ratio: height / width })
          onLoad({ pageCount: pdf.numPages })
        }, onError)
      }}
    >
      {sheets ? (
        <PageColumn
          scroller={scroller}
          zoom={zoom}
          pages={sheets.pages}
          ratio={sheets.ratio}
          pending={pending}
          onPageChange={onPageChange}
        >
          {(page, width) => (
            <Page
              pageNumber={page}
              width={width}
              // Sharp on a retina screen without a 3× canvas at 200% zoom.
              devicePixelRatio={Math.min(window.devicePixelRatio, 2)}
              loading={null}
            />
          )}
        </PageColumn>
      ) : (
        pending
      )}
    </Document>
  )
}
