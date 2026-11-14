import type { DataTableLabels } from './types'

export const DEFAULT_TABLE_LABELS: DataTableLabels = {
  selectAll: 'Select all rows on this page',
  selectRow: (row) => `Select ${row}`,
  expandRow: (row) => `Show details for ${row}`,
  sortBy: (column) => `Sort by ${column}`,
  selected: (n) => `${n.toLocaleString()} selected`,
  selectedOf: (n, max) => `${n.toLocaleString()} of ${max.toLocaleString()} selected`,
  selectedOne: (row) => `${row} selected`,
  clearSelection: 'Clear',
  emptyTitle: 'Nothing here yet',
  emptyBody: 'Rows will show up here once there are some.',
  errorTitle: 'Couldn’t load this list',
  errorBody:
    'Something went wrong on the way. Your filters are kept, so trying again picks up where you were.',
  retry: 'Try again',
}

/** About seven rows: the rows area never gets shorter than this. */
export const MIN_BODY_HEIGHT = '22rem'
/** The header row, `h-11`. */
export const HEADER_HEIGHT = '2.75rem'

/** The bulk bar's count, which depends on the limit. */
export function selectionLabel<T>(
  t: DataTableLabels,
  selected: string[],
  rows: T[],
  rowId: (row: T) => string,
  rowLabel: ((row: T) => string) | undefined,
  max: number | undefined,
): string {
  if (max === 1 && selected.length === 1) {
    const row = rows.find((r) => rowId(r) === selected[0])
    return t.selectedOne(row && rowLabel ? rowLabel(row) : selected[0])
  }
  return max ? t.selectedOf(selected.length, max) : t.selected(selected.length)
}
