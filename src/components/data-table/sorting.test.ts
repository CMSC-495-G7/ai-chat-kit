import { describe, expect, it } from 'vitest'
import type { Sort } from '../paging'
import {
  directionFor,
  enabledSort,
  isColumnSortable,
  sortRows,
  toggleSort,
  toSortParam,
} from './sorting'
import type { Column } from './types'

type Row = {
  id: string
  name: string
  seats: number | string | null
  created: string | Date | number | null
  note?: string
}

const col = (over: Partial<Column<Row>> & { id: string }): Column<Row> => ({
  header: over.id,
  cell: () => null,
  ...over,
})

const COLUMNS: Column<Row>[] = [
  col({ id: 'name', sortKey: 'name' }),
  col({ id: 'seats', sortKey: 'seats', sortType: 'number' }),
  col({ id: 'created', sortKey: 'created_at', sortType: 'date', sortValue: (r) => r.created }),
  col({ id: 'note', sortKey: 'note', sortable: false }),
  col({ id: 'plain' }), // no sortKey: not sortable at all
]

const ids = (rows: Row[]) => rows.map((r) => r.id)
const asc = (field: string): Sort[] => [{ field, direction: 'asc' }]
const desc = (field: string): Sort[] => [{ field, direction: 'desc' }]

describe('isColumnSortable', () => {
  it('needs a sortKey', () => {
    expect(isColumnSortable({ sortKey: 'name' })).toBe(true)
    expect(isColumnSortable({})).toBe(false)
    expect(isColumnSortable({ sortKey: '' })).toBe(false)
  })

  it('can be switched off for one column, keeping its key', () => {
    expect(isColumnSortable({ sortKey: 'note', sortable: false })).toBe(false)
    expect(isColumnSortable({ sortKey: 'note', sortable: true })).toBe(true)
  })

  it('can be switched off for the whole table', () => {
    expect(isColumnSortable({ sortKey: 'name' }, false)).toBe(false)
    expect(isColumnSortable({ sortKey: 'name', sortable: true }, false)).toBe(false)
  })
})

describe('enabledSort and toSortParam', () => {
  it('keep only what names an enabled column', () => {
    const sort: Sort[] = [
      { field: 'name', direction: 'asc' },
      { field: 'note', direction: 'desc' }, // switched off
      { field: 'ghost', direction: 'asc' }, // no such column
    ]
    expect(enabledSort(sort, COLUMNS)).toEqual([{ field: 'name', direction: 'asc' }])
  })

  it('write the query value with the key the backend knows, not the column id', () => {
    expect(toSortParam(asc('created_at'), COLUMNS)).toBe('created_at,asc')
    expect(toSortParam(desc('seats'), COLUMNS)).toBe('seats,desc')
  })

  it('leave the parameter off when nothing enabled is sorted, so the call cannot fail on it', () => {
    expect(toSortParam([], COLUMNS)).toBeUndefined()
    expect(toSortParam(asc('note'), COLUMNS)).toBeUndefined()
    expect(toSortParam(asc('ghost'), COLUMNS)).toBeUndefined()
    expect(toSortParam(asc('name'), COLUMNS, false)).toBeUndefined()
  })

  it('send several clauses in the order given, dropping only the disabled one', () => {
    const sort: Sort[] = [
      { field: 'name', direction: 'asc' },
      { field: 'note', direction: 'asc' },
      { field: 'seats', direction: 'desc' },
    ]
    expect(toSortParam(sort, COLUMNS)).toBe('name,asc;seats,desc')
  })
})

describe('sortRows, numbers', () => {
  const rows: Row[] = [
    { id: 'a', name: 'a', seats: 412, created: null },
    { id: 'b', name: 'b', seats: 88, created: null },
    { id: 'c', name: 'c', seats: 12, created: null },
    { id: 'd', name: 'd', seats: 903, created: null },
    { id: 'e', name: 'e', seats: 0, created: null },
  ]

  it('compares as numbers, not as strings (where 88 would come after 412)', () => {
    expect(ids(sortRows(rows, asc('seats'), COLUMNS))).toEqual(['e', 'c', 'b', 'a', 'd'])
    expect(ids(sortRows(rows, desc('seats'), COLUMNS))).toEqual(['d', 'a', 'b', 'c', 'e'])
  })

  it('reads numbers that arrived as strings, and negatives and decimals', () => {
    const mixed: Row[] = [
      { id: 'a', name: 'a', seats: '10', created: null },
      { id: 'b', name: 'b', seats: '9.5', created: null },
      { id: 'c', name: 'c', seats: -3, created: null },
    ]
    expect(ids(sortRows(mixed, asc('seats'), COLUMNS))).toEqual(['c', 'b', 'a'])
  })

  it('puts a missing or non-numeric value last, whichever way it sorts', () => {
    const gaps: Row[] = [
      { id: 'a', name: 'a', seats: null, created: null },
      { id: 'b', name: 'b', seats: 5, created: null },
      { id: 'c', name: 'c', seats: 'n/a', created: null },
      { id: 'd', name: 'd', seats: 1, created: null },
      { id: 'e', name: 'e', seats: '', created: null },
    ]
    expect(ids(sortRows(gaps, asc('seats'), COLUMNS)).slice(0, 2)).toEqual(['d', 'b'])
    expect(ids(sortRows(gaps, desc('seats'), COLUMNS)).slice(0, 2)).toEqual(['b', 'd'])
    // The three with nothing to compare keep the order they came in, at the end.
    expect(ids(sortRows(gaps, asc('seats'), COLUMNS)).slice(2)).toEqual(['a', 'c', 'e'])
    expect(ids(sortRows(gaps, desc('seats'), COLUMNS)).slice(2)).toEqual(['a', 'c', 'e'])
  })

  it('treats zero as a number, not as missing', () => {
    const zero: Row[] = [
      { id: 'a', name: 'a', seats: null, created: null },
      { id: 'b', name: 'b', seats: 0, created: null },
    ]
    expect(ids(sortRows(zero, asc('seats'), COLUMNS))).toEqual(['b', 'a'])
  })
})

describe('sortRows, text', () => {
  const names = (list: string[]): Row[] =>
    list.map((name) => ({ id: name, name, seats: null, created: null }))

  it('ignores case', () => {
    expect(
      ids(sortRows(names(['banana', 'Apple', 'cherry', 'apricot']), asc('name'), COLUMNS)),
    ).toEqual(['Apple', 'apricot', 'banana', 'cherry'])
  })

  it('counts a number inside text as a number: Suite 2 before Suite 10', () => {
    expect(ids(sortRows(names(['Suite 10', 'Suite 2', 'Suite 1']), asc('name'), COLUMNS))).toEqual([
      'Suite 1',
      'Suite 2',
      'Suite 10',
    ])
  })

  it('treats accents as the same letter', () => {
    // Zoë and Zoe are equal to the collator, so they keep the order they came in.
    expect(ids(sortRows(names(['Zoë', 'Zoe', 'Adam']), asc('name'), COLUMNS))).toEqual([
      'Adam',
      'Zoë',
      'Zoe',
    ])
    expect(ids(sortRows(names(['Zoe', 'Zoë', 'Adam']), asc('name'), COLUMNS))).toEqual([
      'Adam',
      'Zoe',
      'Zoë',
    ])
  })

  it('reverses for descending', () => {
    expect(ids(sortRows(names(['b', 'c', 'a']), desc('name'), COLUMNS))).toEqual(['c', 'b', 'a'])
  })

  it('keeps equal rows in the order they came in', () => {
    const rows: Row[] = [
      { id: '1', name: 'same', seats: null, created: null },
      { id: '2', name: 'Same', seats: null, created: null },
      { id: '3', name: 'SAME', seats: null, created: null },
    ]
    expect(ids(sortRows(rows, asc('name'), COLUMNS))).toEqual(['1', '2', '3'])
    expect(ids(sortRows(rows, desc('name'), COLUMNS))).toEqual(['1', '2', '3'])
  })
})

describe('sortRows, dates', () => {
  const dated = (list: Row['created'][]): Row[] =>
    list.map((created, i) => ({ id: String(i), name: '', seats: null, created }))

  it('orders ISO dates as moments, and reads them through the column key the backend uses', () => {
    const rows = dated(['2026-03-14', '2025-12-30', '2026-01-02', '2026-02-21'])
    expect(ids(sortRows(rows, asc('created_at'), COLUMNS))).toEqual(['1', '2', '3', '0'])
    expect(ids(sortRows(rows, desc('created_at'), COLUMNS))).toEqual(['0', '3', '2', '1'])
  })

  it('takes full timestamps, Date objects and epoch numbers alike', () => {
    const rows = dated([
      '2026-03-14T09:30:00Z',
      new Date('2026-03-14T08:00:00Z'),
      Date.parse('2026-03-14T10:00:00Z'),
      '2026-03-13T23:59:59Z',
    ])
    expect(ids(sortRows(rows, asc('created_at'), COLUMNS))).toEqual(['3', '1', '0', '2'])
  })

  it('puts a missing or unreadable date last, whichever way it sorts', () => {
    const rows = dated([null, '2026-03-14', 'not a date', '2026-01-01', ''])
    expect(ids(sortRows(rows, asc('created_at'), COLUMNS)).slice(0, 2)).toEqual(['3', '1'])
    expect(ids(sortRows(rows, desc('created_at'), COLUMNS)).slice(0, 2)).toEqual(['1', '3'])
  })
})

describe('sortRows, what it leaves alone', () => {
  const rows: Row[] = [
    { id: 'a', name: 'b', seats: 2, created: null, note: 'z' },
    { id: 'b', name: 'a', seats: 1, created: null, note: 'a' },
  ]

  it('returns the same array when there is nothing to sort by', () => {
    expect(sortRows(rows, [], COLUMNS)).toBe(rows)
  })

  it('ignores a sort on a column that is switched off, or that does not exist', () => {
    expect(sortRows(rows, asc('note'), COLUMNS)).toBe(rows)
    expect(sortRows(rows, asc('ghost'), COLUMNS)).toBe(rows)
  })

  it('ignores every sort when the whole table is switched off', () => {
    expect(sortRows(rows, asc('name'), COLUMNS, false)).toBe(rows)
  })

  it('never changes the rows it was given', () => {
    const before = ids(rows)
    sortRows(rows, asc('name'), COLUMNS)
    expect(ids(rows)).toEqual(before)
  })

  it('sorts by a second clause when the first ties', () => {
    const tied: Row[] = [
      { id: '1', name: 'x', seats: 5, created: null },
      { id: '2', name: 'x', seats: 3, created: null },
      { id: '3', name: 'a', seats: 9, created: null },
    ]
    const sort: Sort[] = [
      { field: 'name', direction: 'asc' },
      { field: 'seats', direction: 'asc' },
    ]
    expect(ids(sortRows(tied, sort, COLUMNS))).toEqual(['3', '2', '1'])
  })
})

describe('toggleSort and directionFor', () => {
  it('start ascending, then flip, and move to a new column ascending', () => {
    expect(toggleSort('name')).toEqual([{ field: 'name', direction: 'asc' }])
    expect(toggleSort('name', asc('name'))).toEqual([{ field: 'name', direction: 'desc' }])
    expect(toggleSort('name', desc('name'))).toEqual([{ field: 'name', direction: 'asc' }])
    expect(toggleSort('seats', desc('name'))).toEqual([{ field: 'seats', direction: 'asc' }])
  })

  it('say which way a column is sorted, or null when it is not the sort', () => {
    expect(directionFor('name', asc('name'))).toBe('asc')
    expect(directionFor('name', asc('seats'))).toBeNull()
    expect(directionFor(undefined, asc('name'))).toBeNull()
  })
})
