import { describe, expect, it } from 'vitest'
import {
  FACET_NULL_VALUE,
  FACET_ROW_HEIGHT,
  FACET_SEARCH_THRESHOLD,
  countLabel,
  filterRows,
  isHeavyLoad,
  isSearchable,
  orderRows,
  remainingOf,
  resolveMode,
  selectableOf,
  singularOf,
  toRows,
  triState,
  weightOf,
  windowHeight,
} from './facetRules'
import type { FacetGroup } from './types'

const group = (over: Partial<FacetGroup> = {}): FacetGroup => ({
  key: 'accounts',
  label: 'Accounts',
  values: [],
  ...over,
})

const values = (n: number) => Array.from({ length: n }, (_, i) => ({ value: `v${i}`, count: 1 }))

describe('resolveMode', () => {
  it('keeps fully loaded groups local regardless of cardinality', () => {
    expect(resolveMode(group({ values: values(10_000), cardinality: 10_000 }))).toBe('list')
    expect(resolveMode(group({ cardinality: 40_000 }))).toBe('list')
  })

  it('uses lookup for explicit paging metadata', () => {
    expect(
      resolveMode(group({ values: values(5), loaded: 5, matchCount: 40_000, hasMore: true })),
    ).toBe('lookup')
  })

  it('lets the host decide', () => {
    expect(resolveMode(group({ cardinality: 40_000, mode: 'list' }))).toBe('list')
    expect(resolveMode(group({ cardinality: 3, mode: 'lookup' }))).toBe('lookup')
  })
})

describe('isSearchable', () => {
  it('adds a filter field once a list is long enough to need one', () => {
    expect(isSearchable(group({ values: values(FACET_SEARCH_THRESHOLD - 1) }), 'list')).toBe(false)
    expect(isSearchable(group({ values: values(FACET_SEARCH_THRESHOLD) }), 'list')).toBe(true)
  })

  it('always searches a lookup group, which shows nothing until asked', () => {
    expect(isSearchable(group({ values: [] }), 'lookup')).toBe(true)
  })

  it('lets the host force it either way', () => {
    expect(isSearchable(group({ values: values(2), searchable: true }), 'list')).toBe(true)
    expect(isSearchable(group({ values: [], searchable: false }), 'lookup')).toBe(false)
  })
})

describe('toRows', () => {
  it('labels a row with its value when it has no label', () => {
    const [row] = toRows(group({ values: [{ value: '100234', count: 3 }] }), [])
    expect(row).toEqual({
      value: '100234',
      label: '100234',
      count: 3,
      selected: false,
      available: true,
    })
  })

  it('greys out a known zero, but not a count it never received', () => {
    const rows = toRows(
      group({
        values: [
          { value: 'zero', count: 0 },
          { value: 'unknown', count: null },
          { value: 'absent' },
        ],
      }),
      [],
    )
    expect(rows.map((r) => r.available)).toEqual([false, true, true])
  })

  it('keeps a selected row available even at zero, so it can be unticked', () => {
    const [row] = toRows(group({ values: [{ value: 'zero', count: 0 }] }), ['zero'])
    expect(row.selected).toBe(true)
    expect(row.available).toBe(true)
  })

  it('appends a "no value" row to a nullable group', () => {
    const rows = toRows(group({ nullable: true, values: values(2) }), [FACET_NULL_VALUE])
    expect(rows).toHaveLength(3)
    expect(rows.at(-1)).toMatchObject({
      value: FACET_NULL_VALUE,
      label: 'No account',
      selected: true,
      available: true,
    })
  })

  it('uses the host sentinel and label for that row', () => {
    const rows = toRows(group({ nullable: true, nullValue: 'none', nullLabel: 'Unassigned' }), [])
    expect(rows).toEqual([expect.objectContaining({ value: 'none', label: 'Unassigned' })])
  })

  it('does not add the row twice when the host already sent it', () => {
    const rows = toRows(
      group({ nullable: true, values: [{ value: FACET_NULL_VALUE, label: 'No account' }] }),
      [],
    )
    expect(rows).toHaveLength(1)
  })

  it.each([
    ['Status', 'No status'],
    ['Statuses', 'No status'],
    ['Categories', 'No category'],
    ['Document type', 'No document type'],
  ])('names the row for a group labelled "%s" as "%s"', (label, expected) => {
    expect(toRows(group({ label, nullable: true }), []).at(-1)?.label).toBe(expected)
  })
})

describe('singularOf', () => {
  it.each([
    ['Accounts', 'account'],
    ['Doc types', 'doc type'],
    ['Loan Number', 'loan number'],
    ['Categories', 'category'],
    ['Countries', 'country'],
    ['Status', 'status'],
    ['Statuses', 'status'],
    ['Class', 'class'],
    ['Classes', 'class'],
    ['Addresses', 'address'],
    ['Branches', 'branch'],
    ['Boxes', 'box'],
    ['Analysis', 'analysis'],
    ['Causes', 'cause'],
    ['Houses', 'house'],
    ['Days', 'day'],
    ['  Regions ', 'region'],
  ])('reads "%s" as "%s"', (label, expected) => {
    expect(singularOf(label)).toBe(expected)
  })
})

describe('orderRows', () => {
  it('preserves host order regardless of selection and counts', () => {
    const rows = toRows(
      group({
        values: [
          { value: 'b', count: 2 },
          { value: 'a', count: 2 },
          { value: 'big', count: 90 },
          { value: 'unknown', count: null },
          { value: 'picked', count: 1 },
        ],
      }),
      ['picked'],
    )
    expect(orderRows(rows).map((r) => r.value)).toEqual(['b', 'a', 'big', 'unknown', 'picked'])
  })

  it('does not reorder the list it was given', () => {
    const rows = toRows(
      group({
        values: [
          { value: 'a', count: 1 },
          { value: 'b', count: 2 },
        ],
      }),
      [],
    )
    const before = rows.map((r) => r.value)
    orderRows(rows)
    expect(rows.map((r) => r.value)).toEqual(before)
  })
})

describe('filterRows', () => {
  const rows = toRows(
    group({
      values: [
        { value: 'acme', label: 'Acme Lending' },
        { value: 'nw', label: 'Northwind' },
        { value: 'contoso', label: 'Contoso' },
      ],
    }),
    ['contoso'],
  )

  it('matches the label or the value, ignoring case', () => {
    expect(filterRows(rows, 'LEND').map((r) => r.value)).toContain('acme')
    expect(filterRows(rows, 'nw').map((r) => r.value)).toContain('nw')
  })

  it('never filters out a selected row', () => {
    expect(filterRows(rows, 'north').map((r) => r.value)).toEqual(['nw', 'contoso'])
  })

  it('returns everything for a blank query', () => {
    expect(filterRows(rows, '   ')).toBe(rows)
  })
})

describe('triState', () => {
  const state = (selected: string[]) =>
    triState(
      toRows(
        group({
          values: [
            { value: 'a', count: 4 },
            { value: 'b', count: 2 },
            { value: 'dead', count: 0 },
          ],
        }),
        selected,
      ),
    )

  it('is none, some or all of what could still match', () => {
    expect(state([])).toBe('none')
    expect(state(['a'])).toBe('some')
    expect(state(['a', 'b'])).toBe('all')
  })

  it('does not count a greyed-out row against "all"', () => {
    const rows = toRows(
      group({
        values: [
          { value: 'a', count: 1 },
          { value: 'dead', count: 0 },
        ],
      }),
      ['a'],
    )
    expect(selectableOf(rows).map((r) => r.value)).toEqual(['a'])
    expect(triState(rows)).toBe('all')
  })

  it('is none when nothing can be selected', () => {
    expect(triState(toRows(group({ values: [{ value: 'dead', count: 0 }] }), []))).toBe('none')
    expect(triState([])).toBe('none')
  })
})

describe('loading what is left', () => {
  it('works out what a group still has to fetch', () => {
    expect(remainingOf(500, 1490)).toBe(990)
    expect(remainingOf(1490, 1490)).toBe(0)
    expect(remainingOf(1600, 1490)).toBe(0)
    expect(remainingOf(500, undefined)).toBe(0)
  })

  it('reports the weight in KB, then in MB', () => {
    expect(weightOf(1)).toBe('1 KB')
    expect(weightOf(1490)).toBe('81 KB')
    expect(weightOf(20_000)).toBe('1.1 MB')
  })

  it('warns by payload, so 1,490 loan numbers pass quietly and 5,000 do not', () => {
    expect(isHeavyLoad(1490)).toBe(false)
    expect(isHeavyLoad(5000)).toBe(true)
  })

  it('sizes the virtual window in whole rows', () => {
    expect(windowHeight('comfortable')).toBe(9 * FACET_ROW_HEIGHT)
    expect(windowHeight('compact')).toBe(6 * FACET_ROW_HEIGHT)
  })
})

describe('countLabel', () => {
  it('writes a count, a dash for an unknown, and nothing while refreshing', () => {
    expect(countLabel(12, false)).toBe('12')
    expect(countLabel(0, false)).toBe('0')
    expect(countLabel(null, false)).toBe('—')
    expect(countLabel(undefined, false)).toBe('—')
    expect(countLabel(12, true)).toBeNull()
  })
})
