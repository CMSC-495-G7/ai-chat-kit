import { describe, expect, it } from 'vitest'
import { pageWindow } from './pageWindow'

describe('pageWindow', () => {
  it('lists every page when they all fit', () => {
    expect(pageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('opens with a run from the start and one gap before the last page', () => {
    expect(pageWindow(1, 129)).toEqual([1, 2, 3, 4, 5, 'gap', 129])
  })

  it('puts the current page between two gaps in the middle', () => {
    expect(pageWindow(8, 129)).toEqual([1, 'gap', 7, 8, 9, 'gap', 129])
  })

  it('closes with a run to the end', () => {
    expect(pageWindow(129, 129)).toEqual([1, 'gap', 125, 126, 127, 128, 129])
  })

  it('widens with more boundary and sibling pages', () => {
    expect(pageWindow(8, 129, { boundaryCount: 2, siblingCount: 2 })).toEqual([
      1,
      2,
      'gap',
      6,
      7,
      8,
      9,
      10,
      'gap',
      128,
      129,
    ])
  })

  it('has nothing to show for no pages, and one slot for one', () => {
    expect(pageWindow(1, 0)).toEqual([])
    expect(pageWindow(1, 1)).toEqual([1])
  })

  it('treats a page outside the range as the nearest end', () => {
    expect(pageWindow(500, 129)).toEqual(pageWindow(129, 129))
    expect(pageWindow(0, 129)).toEqual(pageWindow(1, 129))
  })

  // The two properties the rail is built around, checked on every page of
  // every count from "just fits" to well past where the gaps appear.
  const counts = [8, 9, 10, 11, 12, 20, 129]

  it.each(counts)('keeps the same length on every page of %i', (count) => {
    const lengths = new Set<number>()
    for (let page = 1; page <= count; page++) lengths.add(pageWindow(page, count).length)
    expect([...lengths]).toEqual([7])
  })

  it.each(counts)('never hides a single page behind a gap, out of %i', (count) => {
    for (let page = 1; page <= count; page++) {
      const slots = pageWindow(page, count)
      slots.forEach((slot, i) => {
        if (slot !== 'gap') return
        const hidden = (slots[i + 1] as number) - (slots[i - 1] as number) - 1
        expect(hidden, `page ${page}`).toBeGreaterThan(1)
      })
    }
  })

  it.each(counts)('always shows the first, the last and the current page of %i', (count) => {
    for (let page = 1; page <= count; page++) {
      const slots = pageWindow(page, count)
      expect(slots[0]).toBe(1)
      expect(slots.at(-1)).toBe(count)
      expect(slots).toContain(page)
      const numbers = slots.filter((slot) => slot !== 'gap') as number[]
      expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b))
    }
  })
})
