import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFacetRows } from './useFacetRows'
import type { FacetGroup } from './types'

const initial: FacetGroup = {
  key: 'accounts',
  label: 'Accounts',
  values: [
    { value: 'b', label: 'Beta', count: 2 },
    { value: 'a', label: 'Alpha', count: 1 },
  ],
}

describe('facet presentation across host updates', () => {
  it('keeps targets in place when counts, selection, and response order change', () => {
    const { result, rerender } = renderHook(
      ({ group, selection }) => useFacetRows(group, selection, '', false),
      { initialProps: { group: initial, selection: [] as string[] } },
    )
    rerender({
      group: {
        ...initial,
        values: [
          { value: 'a', label: 'Alpha', count: 900 },
          { value: 'b', label: 'Beta', count: 0 },
        ],
      },
      selection: ['b'],
    })
    expect(result.current.map((row) => row.value)).toEqual(['b', 'a'])
    expect(result.current[0]).toMatchObject({ selected: true, available: true, count: 0 })
    rerender({
      group: {
        ...initial,
        values: [
          { value: 'new', count: 10 },
          { value: 'a', count: 900 },
        ],
      },
      selection: [],
    })
    expect(result.current.map((row) => row.value)).toEqual(['a', 'new'])
  })

  it('searches changed labels without exposing non-matching selected rows', () => {
    const { result, rerender } = renderHook(
      ({ group, query }) => useFacetRows(group, ['b'], query, false),
      { initialProps: { group: initial, query: 'ALPHA' } },
    )
    expect(result.current.map((row) => row.value)).toEqual(['a'])
    rerender({
      group: { ...initial, values: [{ value: 'a', label: 'Renamed', count: 1 }] },
      query: 'RENAME',
    })
    expect(result.current[0].label).toBe('Renamed')
  })

  it('accepts remote matches on fields absent from the label', () => {
    const { result } = renderHook(() => useFacetRows(initial, [], 'hidden-field-match', true))
    expect(result.current).toHaveLength(2)
  })
})
