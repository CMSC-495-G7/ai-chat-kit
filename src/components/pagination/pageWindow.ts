/** A slot in the page rail: a page number, or a break standing in for a run of them. */
export type PageSlot = number | 'gap'

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i)

export type PageWindowOptions = {
  /** Pages pinned at each end. 1 gives `1 … 129`. */
  boundaryCount?: number
  /** Pages either side of the current one. 1 gives `… 7 8 9 …` on page 8. */
  siblingCount?: number
}

/**
 * The `1 2 3 … 128 129` rail.
 *
 * Two properties matter more than the exact output. First, the rail's length
 * is stable — it does not grow and shrink as you page through, so the Next
 * button stays under the pointer. Second, a gap is only ever drawn in place of
 * *more than one* hidden page: collapsing a single page into an ellipsis costs
 * the same width and takes away a click, which is why the two "else" branches
 * below emit a bare number instead.
 *
 * Kept separate from the component because it is the only part with edge
 * cases worth testing directly — page 1, the last page, and counts just either
 * side of the point where gaps appear.
 */
export function pageWindow(
  page: number,
  totalPages: number,
  { boundaryCount = 1, siblingCount = 1 }: PageWindowOptions = {},
): PageSlot[] {
  const count = Math.max(0, Math.floor(totalPages))
  if (count <= 1) return count === 1 ? [1] : []

  const current = Math.min(Math.max(1, Math.floor(page)), count)

  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  )

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (['gap'] as PageSlot[])
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (['gap'] as PageSlot[])
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ]
}
