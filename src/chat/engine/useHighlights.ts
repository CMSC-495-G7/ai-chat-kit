// React hook over the pure highlight helpers: derives the ranges to mark for a
// given reference. Reusable by any surface that renders highlightable markdown
// (today: the source doc in ReferencePanel, via Markdown).

import { useMemo } from 'react'
import type { Highlight } from './types'
import { rangesForReference, type HighlightRange } from './highlights'

/** Memoized ranges for the active reference, resolved against the doc text. */
export function useHighlightRanges(
  highlights: Highlight[] | undefined,
  activeRef: number | null,
  textLength: number,
): HighlightRange[] {
  return useMemo(
    () => rangesForReference(highlights, activeRef, textLength),
    [highlights, activeRef, textLength],
  )
}
