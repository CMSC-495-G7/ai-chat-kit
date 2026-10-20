import { describe, expect, it } from 'vitest'
import {
  datePresets,
  dateRangePresets,
  upcomingRangePresets,
  daysBetween,
  formatDisplay,
  formatRange,
  parseTyped,
} from './date-text'

describe('parseTyped', () => {
  it.each([
    '2026-09-30',
    '9/30/2026',
    '09/30/2026',
    '9.30.26',
    'Sep 30, 2026',
    'sep 30 2026',
    'Sept. 30th, 2026',
    'September 30 2026',
    '30 Sep 2026',
    '  Sep 30, 2026  ',
  ])('reads "%s" as 30 September 2026', (text) => {
    expect(parseTyped(text)).toEqual({ value: '2026-09-30' })
  })

  it('reads an empty field as no date, not as a mistake', () => {
    expect(parseTyped('')).toEqual({ value: null })
    expect(parseTyped('   ')).toEqual({ value: null })
  })

  it('reads numbers in US order: month first', () => {
    expect(parseTyped('3/4/2026')).toEqual({ value: '2026-03-04' })
  })

  it.each(['soon', '13/1/2026', 'Sep 2026', 'Xyz 3, 2026', '2026-9'])(
    'asks for a date it can read when given "%s"',
    (text) => {
      expect(parseTyped(text)).toEqual({ error: 'Enter a date like Sep 30, 2026.' })
    },
  )

  it('names the month when the day does not exist', () => {
    expect(parseTyped('Feb 29, 2027')).toEqual({ error: 'February has 28 days in 2027.' })
    expect(parseTyped('6/31/2026')).toEqual({ error: 'June has 30 days in 2026.' })
  })

  it('knows a leap year', () => {
    expect(parseTyped('Feb 29, 2028')).toEqual({ value: '2028-02-29' })
  })

  it('holds the date inside min and max, both inclusive', () => {
    const min = '2026-09-05'
    const max = '2026-09-15'
    expect(parseTyped('Sep 4, 2026', min, max)).toEqual({
      error: 'Choose a date on or after Sep 5, 2026.',
    })
    expect(parseTyped('Sep 16, 2026', min, max)).toEqual({
      error: 'Choose a date on or before Sep 15, 2026.',
    })
    expect(parseTyped('Sep 5, 2026', min, max)).toEqual({ value: min })
    expect(parseTyped('Sep 15, 2026', min, max)).toEqual({ value: max })
  })
})

describe('formatDisplay and formatRange', () => {
  it('writes a date the way the field shows it', () => {
    expect(formatDisplay('2026-09-30')).toBe('Sep 30, 2026')
    expect(formatDisplay('2026-09-30', false)).toBe('Sep 30')
    expect(formatDisplay(null)).toBe('')
  })

  it('round-trips through parseTyped', () => {
    for (const value of ['2026-01-01', '2026-02-28', '2028-02-29', '2026-12-31']) {
      expect(parseTyped(formatDisplay(value))).toEqual({ value })
    }
  })

  it('writes the year once when both ends share it', () => {
    expect(formatRange({ from: '2026-09-06', to: '2026-09-15' })).toBe('Sep 6 – Sep 15, 2026')
  })

  it('writes both years when the range crosses one', () => {
    expect(formatRange({ from: '2025-12-28', to: '2026-01-03' })).toBe('Dec 28, 2025 – Jan 3, 2026')
  })

  it('leaves the end open until it is chosen', () => {
    expect(formatRange({ from: '2026-09-06', to: null })).toBe('Sep 6, 2026 – …')
    expect(formatRange({ from: null, to: null })).toBe('')
  })
})

describe('daysBetween', () => {
  it('counts both ends', () => {
    expect(daysBetween('2026-09-06', '2026-09-15')).toBe(10)
    expect(daysBetween('2026-09-06', '2026-09-06')).toBe(1)
  })

  it('is not thrown by a clock change inside the range', () => {
    // US daylight saving starts 8 March 2026 and ends 1 November 2026.
    expect(daysBetween('2026-03-01', '2026-03-31')).toBe(31)
    expect(daysBetween('2026-10-25', '2026-11-05')).toBe(12)
  })

  it('is zero when either end is not a date', () => {
    expect(daysBetween('', '2026-09-15')).toBe(0)
  })
})

describe('presets', () => {
  // Monday 5 October 2026: the first month of the fourth quarter.
  const today = new Date(2026, 9, 5)

  it('offers single dates relative to today', () => {
    expect(datePresets(today)).toEqual([
      { label: 'Today', value: '2026-10-05' },
      { label: 'Tomorrow', value: '2026-10-06' },
      { label: 'End of month', value: '2026-10-31' },
      { label: 'End of quarter', value: '2026-12-31' },
      { label: 'In 90 days', value: '2027-01-03' },
    ])
  })

  it('offers ranges that end today, with day counts that match their names', () => {
    const presets = dateRangePresets(today)
    expect(presets.every((preset) => preset.value.to === '2026-10-05')).toBe(true)

    const from = (label: string) => presets.find((p) => p.label === label)!.value.from!
    expect(daysBetween(from('Last 7 days'), '2026-10-05')).toBe(7)
    expect(daysBetween(from('Last 30 days'), '2026-10-05')).toBe(30)
    expect(from('This month')).toBe('2026-10-01')
    expect(from('This quarter')).toBe('2026-10-01')
    expect(from('Year to date')).toBe('2026-01-01')
  })

  it('offers a 90 day pick and a short label for the ones that fit a tight control', () => {
    const presets = dateRangePresets(today)
    const last90 = presets.find((p) => p.label === 'Last 90 days')!
    expect(daysBetween(last90.value.from!, '2026-10-05')).toBe(90)
    expect(presets.filter((p) => p.short).map((p) => p.short)).toEqual(['7D', '30D', '90D', 'YTD'])
  })

  it('offers picks that look ahead, with Overdue as the one that has no start', () => {
    const presets = upcomingRangePresets(today)
    const get = (label: string) => presets.find((p) => p.label === label)!.value
    expect(get('Overdue')).toEqual({ from: null, to: '2026-10-04' })
    expect(get('Today')).toEqual({ from: '2026-10-05', to: '2026-10-05' })
    expect(daysBetween(get('Next 7 days').from!, get('Next 7 days').to!)).toBe(7)
    expect(daysBetween(get('Next 30 days').from!, get('Next 30 days').to!)).toBe(30)
    expect(get('This month')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(get('This quarter')).toEqual({ from: '2026-10-01', to: '2026-12-31' })
    expect(presets.filter((p) => p.short).map((p) => p.short)).toEqual([
      'Overdue',
      'Next 7D',
      'Next 30D',
      'Quarter',
    ])
  })

  it('ends the quarter in the right month from anywhere inside it', () => {
    const endOfQuarter = (date: Date) =>
      datePresets(date).find((p) => p.label === 'End of quarter')!.value
    expect(endOfQuarter(new Date(2026, 0, 15))).toBe('2026-03-31')
    expect(endOfQuarter(new Date(2026, 5, 30))).toBe('2026-06-30')
    expect(endOfQuarter(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})
