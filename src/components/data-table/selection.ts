// How a click on a row's checkbox (or radio) changes the selection. Kept out of
// the component so the rules can be tested without a browser.

/**
 * The selection after toggling one row.
 *
 * Without a limit, a row goes in or comes out. With `max`, the ids are kept in
 * the order they were picked, and a pick past the limit drops the oldest one.
 * So `max: 1` behaves like radio buttons (the new row replaces the old), and
 * `max: 3` keeps the three most recent picks.
 */
export function toggleSelection(selected: string[], id: string, max?: number): string[] {
  if (selected.includes(id)) {
    // A radio does not uncheck itself: clicking the picked row again keeps it.
    // Clearing a single pick is the bulk bar's Clear.
    return max === 1 ? selected : selected.filter((v) => v !== id)
  }
  const next = [...selected, id]
  return max && max > 0 && next.length > max ? next.slice(next.length - max) : next
}

/**
 * Whether the header's select-all can be offered. With a limit smaller than
 * the page, "all" would silently mean "some", so there is no select-all.
 */
export function canSelectAll(pageCount: number, max?: number): boolean {
  if (pageCount === 0) return false
  if (max === 1) return false
  return !max || pageCount <= max
}

/** Select-all on a page: every row on it in, or every row on it out. */
export function toggleAll(selected: string[], pageIds: string[]): string[] {
  const all = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  return all
    ? selected.filter((id) => !pageIds.includes(id))
    : [...new Set([...selected, ...pageIds])]
}

/**
 * A host's selection, trimmed to the limit. A host that hands in more ids than
 * `max` allows (an old saved selection, say) gets the most recent ones kept.
 */
export function clampSelection(selected: string[], max?: number): string[] {
  return max && max > 0 && selected.length > max ? selected.slice(selected.length - max) : selected
}
