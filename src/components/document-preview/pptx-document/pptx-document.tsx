import { useEffect, useRef, useState } from 'react'
import {
  buildPresentation,
  parseZipLazyMedia,
  RECOMMENDED_ZIP_LIMITS,
  renderSlide,
} from '@aiden0z/pptx-renderer'
import type { PresentationData } from '@aiden0z/pptx-renderer'
import { PageColumn } from '../page-column'
import type { DocumentRendererProps } from '../types'

// The library's own viewer rebuilds every slide on each zoom and resize, and
// drops the reader back at the top when it does. So only its parser and its
// one-slide renderer are used: a slide is drawn once, at the deck's own size,
// and fitted with a transform — the layout around it is PageColumn's, the same
// one a PDF gets.
const SLIDE = {
  // Vector art saved as EMF sometimes carries a PDF of itself, and to draw that
  // the library guesses at a URL for pdf.js and starts a worker to fetch it.
  // Off: such a picture falls back to its bitmap, or is left out.
  pdfjs: false,
} as const

async function fetchFile(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.arrayBuffer()
}

/**
 * A PowerPoint deck as a column of slides, fitted to the scroll box's width
 * and multiplied by `zoom`. A slide keeps its layout at any size — nothing
 * reflows — and its text stays text: selectable, and read by assistive tech.
 */
export default function PptxDocument({
  src,
  zoom,
  scroller,
  pending,
  onLoad,
  onPageChange,
  onError,
}: DocumentRendererProps) {
  const [deck, setDeck] = useState<PresentationData | null>(null)

  useEffect(() => {
    const abort = new AbortController()
    const open = async () => {
      const file = typeof src === 'string' ? await fetchFile(src, abort.signal) : src
      const bytes = file instanceof Blob ? await file.arrayBuffer() : file
      // A deck is a zip, and the limits are what stop a small file unpacking
      // into gigabytes. Pictures are decoded, and a slide's shapes parsed, when
      // that slide is first drawn — so opening costs the same for 5 slides or 500.
      const files = await parseZipLazyMedia(bytes, RECOMMENDED_ZIP_LIMITS)
      const opened = buildPresentation(files, { lazySlides: true })
      if (abort.signal.aborted) return
      setDeck(opened)
      onLoad({ pageCount: opened.slides.length })
    }
    open().catch((error) => {
      if (!abort.signal.aborted) onError(error)
    })
    return () => abort.abort()
  }, [src, onLoad, onError])

  if (!deck) return pending

  return (
    <PageColumn
      scroller={scroller}
      zoom={zoom}
      pages={deck.slides.length}
      ratio={deck.height / deck.width}
      pending={pending}
      onPageChange={onPageChange}
    >
      {(page, width, height) => (
        <Slide deck={deck} index={page - 1} width={width} height={height} />
      )}
    </PageColumn>
  )
}

type SlideProps = { deck: PresentationData; index: number; width: number; height: number }

/** One slide, drawn at the deck's size and scaled to its sheet. */
function Slide({ deck, index, width, height }: SlideProps) {
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = frame.current
    if (!node) return
    let drawn
    try {
      drawn = renderSlide(deck, deck.slides[index], SLIDE)
    } catch {
      // A shape the library can't draw is skipped by the library itself. A
      // whole slide failing is left as a blank sheet: one bad slide shouldn't
      // cost the reader the rest of the deck.
      return
    }
    node.replaceChildren(drawn.element)
    return () => {
      // Releases the slide's charts and the object URLs of its pictures.
      drawn.dispose()
      node.replaceChildren()
    }
  }, [deck, index])

  return (
    // The transform doesn't change the space the slide takes up, so the sheet
    // is given its size here and clips the unscaled box.
    <div className="overflow-hidden" style={{ width, height }}>
      <div
        ref={frame}
        className="origin-top-left"
        style={{ width: deck.width, height: deck.height, scale: width / deck.width }}
      />
    </div>
  )
}
