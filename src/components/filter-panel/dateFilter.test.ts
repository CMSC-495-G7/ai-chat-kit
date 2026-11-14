import { describe, expect, it } from 'vitest'
import { activePreset, describeRange, hasRange, presetsOf, sameRange } from './dateFilter'
import type { DateRangeFilterField } from './types'

const today = new Date(2026, 9, 5)
const field = (over: Partial<DateRangeFilterField> = {}): DateRangeFilterField => ({
  id: 'created',
  label: 'Created',
  type: 'dateRange',
  value: { from: null, to: null },
  onChange: () => {},
  ...over,
})

describe('presetsOf', () => {
  it('is empty until presets are asked for', () => {
    expect(presetsOf(field(), today)).toEqual([])
    expect(presetsOf(field({ presets: false }), today)).toEqual([])
  })

  it('takes the built-in set for the direction the date points', () => {
    const past = presetsOf(field({ presets: true }), today).map((p) => p.label)
    const ahead = presetsOf(field({ presets: true, direction: 'future' }), today).map(
      (p) => p.label,
    )
    expect(past).toContain('Last 30 days')
    expect(past).not.toContain('Overdue')
    expect(ahead).toContain('Overdue')
    expect(ahead).not.toContain('Last 30 days')
  })

  it("uses the host's own list as it is", () => {
    const own = [{ label: 'Q3', value: { from: '2026-07-01', to: '2026-09-30' } }]
    expect(presetsOf(field({ presets: own }), today)).toBe(own)
  })
})

describe('sameRange and hasRange', () => {
  it('count an open end as part of the range', () => {
    expect(sameRange({ from: null, to: '2026-10-04' }, { from: null, to: '2026-10-04' })).toBe(true)
    expect(
      sameRange({ from: null, to: '2026-10-04' }, { from: '2026-10-01', to: '2026-10-04' }),
    ).toBe(false)
    expect(hasRange({ from: null, to: '2026-10-04' })).toBe(true)
    expect(hasRange({ from: null, to: null })).toBe(false)
  })
})

describe('activePreset and describeRange', () => {
  const last30 = { from: '2026-09-06', to: '2026-10-05' }

  it('recognise the pick a range came from, so a preset need not be stored', () => {
    const f = field({ presets: true, value: last30 })
    expect(activePreset(f, today)?.label).toBe('Last 30 days')
    expect(describeRange(f, 'Any time', today)).toBe('Last 30 days')
  })

  it('say "Any time" while nothing is set', () => {
    expect(describeRange(field({ presets: true }), 'Any time', today)).toBe('Any time')
  })

  it('leave the year off a custom range inside this year, so it fits a narrow row', () => {
    const f = field({ presets: true, value: { from: '2026-07-11', to: '2026-08-02' } })
    expect(describeRange(f, 'Any time', today)).toBe('Jul 11 – Aug 2')
    expect(
      describeRange(field({ value: { from: '2026-08-02', to: '2026-08-02' } }), 'Any time', today),
    ).toBe('Aug 2')
  })

  it('keep the year when a range reaches outside this one, or has an open end', () => {
    expect(
      describeRange(field({ value: { from: '2025-12-20', to: '2026-01-10' } }), 'Any time', today),
    ).toBe('Dec 20, 2025 – Jan 10, 2026')
    expect(
      describeRange(field({ value: { from: null, to: '2026-10-04' } }), 'Any time', today),
    ).toBe('Up to Oct 4, 2026')
    expect(
      describeRange(field({ value: { from: '2026-10-01', to: null } }), 'Any time', today),
    ).toBe('From Oct 1, 2026')
  })
})
