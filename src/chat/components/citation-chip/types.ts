import type { CitationPreview } from '../../engine/highlights'

/**
 * Resolves a citation's preview on demand. Called when a card is about to
 * open, never during render — Markdown memoizes one of these per
 * (sources, highlights) pair and caches what it has already built, so a
 * streaming answer with ten markers doesn't clean ten passages per token.
 * Returns null for an id with no matching source.
 */
export type CitationPreviewLookup = (sourceId: number) => CitationPreview | null

export type CitationChipProps = {
  n: number
  onClick?: () => void
  /** Present → the chip grows a hover/focus preview card. Absent → exactly
   *  today's behaviour, so existing call sites are untouched. */
  preview?: CitationPreviewLookup
}
