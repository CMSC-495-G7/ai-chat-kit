import { describe, expect, it } from 'vitest'
import { canSelectAll, clampSelection, toggleAll, toggleSelection } from './selection'

describe('toggleSelection', () => {
  it('adds and removes freely without a limit', () => {
    expect(toggleSelection([], 'a')).toEqual(['a'])
    expect(toggleSelection(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
    expect(toggleSelection(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('with a limit of 1, a new pick replaces the old one, like a radio', () => {
    expect(toggleSelection(['a'], 'b', 1)).toEqual(['b'])
  })

  it('with a limit of 1, picking the same row again keeps it', () => {
    expect(toggleSelection(['a'], 'a', 1)).toEqual(['a'])
  })

  it('past a larger limit, the oldest pick drops out', () => {
    expect(toggleSelection(['a', 'b', 'c'], 'd', 3)).toEqual(['b', 'c', 'd'])
  })

  it('under the limit, unchecking still works', () => {
    expect(toggleSelection(['a', 'b'], 'a', 3)).toEqual(['b'])
  })
})

describe('canSelectAll', () => {
  it('is offered only when the whole page fits under the limit', () => {
    expect(canSelectAll(5)).toBe(true)
    expect(canSelectAll(5, 10)).toBe(true)
    expect(canSelectAll(5, 3)).toBe(false)
    expect(canSelectAll(1, 1)).toBe(false)
    expect(canSelectAll(0)).toBe(false)
  })
})

describe('toggleAll', () => {
  it('selects the page, then clears it, and keeps rows from other pages', () => {
    expect(toggleAll(['x'], ['a', 'b'])).toEqual(['x', 'a', 'b'])
    expect(toggleAll(['x', 'a', 'b'], ['a', 'b'])).toEqual(['x'])
  })
})

describe('clampSelection', () => {
  it('keeps the most recent ids when the host hands in too many', () => {
    expect(clampSelection(['a', 'b', 'c'], 2)).toEqual(['b', 'c'])
    expect(clampSelection(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
  })
})
