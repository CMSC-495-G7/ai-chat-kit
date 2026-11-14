import { formatSort, type Sort } from '../paging'
import type { Column, SortType } from './types'

/**
 * What one click on a sortable header does.
 *
 * Two states, not three. A tri-state cycle (asc → desc → unsorted) reads well
 * in a spec and badly in use: the third click appears to do nothing, because
 * "unsorted" from a server usually means whatever order the query happened to
 * return, which is often the order it was already in. Clearing a sort is the
 * job of a Reset control, where it can say so.
 */
export function toggleSort(sortKey: string, current: Sort[] = []): Sort[] {
  const active = current[0]
  if (active?.field === sortKey) {
    return [{ field: sortKey, direction: active.direction === 'asc' ? 'desc' : 'asc' }]
  }
  return [{ field: sortKey, direction: 'asc' }]
}

/** The direction this column is sorted in, or null when it is not the sort. */
export function directionFor(sortKey: string | undefined, current: Sort[] = []) {
  if (!sortKey) return null
  const active = current[0]
  return active?.field === sortKey ? active.direction : null
}

/**
 * Whether a column's header sorts.
 *
 * It needs a `sortKey`, and neither the column (`sortable: false`) nor the whole
 * table (`sortable={false}`) may have turned sorting off. Everything that
 * decides "can this be sorted?" asks here, so the header, `sortRows` and
 * `toSortParam` can never disagree.
 */
export function isColumnSortable<T>(
  column: Pick<Column<T>, 'sortKey' | 'sortable'>,
  tableSortable = true,
): boolean {
  return tableSortable && Boolean(column.sortKey) && column.sortable !== false
}

/**
 * The clauses a service can be asked for: only those that name an enabled
 * column. A sort left over from another view, or one on a field the backend
 * cannot order by, drops out here instead of reaching the request.
 */
export function enabledSort<T>(sort: Sort[], columns: Column<T>[], tableSortable = true): Sort[] {
  const keys = new Set(
    columns.filter((c) => isColumnSortable(c, tableSortable)).map((c) => c.sortKey as string),
  )
  return sort.filter((clause) => keys.has(clause.field))
}

/**
 * The `sort=` value for a request, or `undefined` when no enabled column is
 * sorted. Leave the parameter off when this is `undefined`: an empty or
 * unsupported `sort=` is what makes a list call fail.
 *
 * ```ts
 * const sort = toSortParam(state, columns)
 * fetch(`/api/tenants?page=1${sort ? `&sort=${sort}` : ''}`)
 * ```
 */
export function toSortParam<T>(
  sort: Sort[],
  columns: Column<T>[],
  tableSortable = true,
): string | undefined {
  const clauses = enabledSort(sort, columns, tableSortable)
  return clauses.length > 0 ? formatSort(clauses) : undefined
}

/** Case-blind, and numbers inside text count as numbers: "Suite 2" comes before "Suite 10". */
const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

/**
 * A value in the form its type compares in, or `null` when it has none: missing,
 * not a number, not a date. Those sort last.
 */
function comparable(value: unknown, type: SortType): number | string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' && value.trim() === '') return null
  if (type === 'number') {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? n : null
  }
  if (type === 'date') {
    const ms =
      value instanceof Date
        ? value.getTime()
        : typeof value === 'number'
          ? value
          : Date.parse(String(value))
    return Number.isFinite(ms) ? ms : null
  }
  return String(value)
}

/**
 * Orders rows in the browser, by the type each sorted column says it is.
 *
 * For a table whose rows are all loaded. A paged table sorts on the server, and
 * its host sends `toSortParam(...)` instead. Both read the same columns, so a
 * column switched off is switched off for both.
 *
 * - A string compare puts "88" after "412". Numbers compare as numbers, dates as
 *   moments (ISO strings, `Date`s and timestamps all work), text as text.
 * - A row with no value for the column goes last, whichever way it sorts,
 *   because "unknown" is not the smallest or the largest.
 * - Equal rows keep the order they came in.
 * - A sort that names no enabled column leaves the rows as they are, and the
 *   same array comes back.
 */
export function sortRows<T>(
  rows: T[],
  sort: Sort[],
  columns: Column<T>[],
  tableSortable = true,
): T[] {
  const clauses = enabledSort(sort, columns, tableSortable).map((clause) => ({
    column: columns.find((c) => c.sortKey === clause.field && isColumnSortable(c, tableSortable))!,
    sign: clause.direction === 'desc' ? -1 : 1,
  }))
  if (clauses.length === 0) return rows

  const read = (column: Column<T>, row: T) =>
    column.sortValue
      ? column.sortValue(row)
      : (row as Record<string, unknown>)[column.sortKey as string]

  const keyed = rows.map((row, index) => ({
    row,
    index,
    keys: clauses.map(({ column }) => comparable(read(column, row), column.sortType ?? 'text')),
  }))
  keyed.sort((a, b) => {
    for (let i = 0; i < clauses.length; i += 1) {
      const x = a.keys[i]
      const y = b.keys[i]
      if (x === null && y === null) continue
      if (x === null) return 1
      if (y === null) return -1
      const order =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : collator.compare(String(x), String(y))
      if (order !== 0) return order * clauses[i].sign
    }
    return a.index - b.index
  })
  return keyed.map((entry) => entry.row)
}
