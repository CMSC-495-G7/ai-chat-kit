// Reading and writing dates as people type and read them. Everything here is a
// local calendar date: `parseDate` from the picker builds dates in local time,
// and nothing is ever round-tripped through UTC.

import { formatDate, parseDate } from '../date-picker/date-value'
import type { DatePreset, DateRange, DateRangePreset, IsoDate } from './types'

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/** "Sep 30, 2026" — or "Sep 30" when the year goes without saying. */
export function formatDisplay(value: IsoDate, withYear = true): string {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

/** "Sep 6 – Sep 15, 2026", with the year once when both ends share it. */
export function formatRange({ from, to }: DateRange): string {
  if (!from) return ''
  if (!to) return `${formatDisplay(from)} – …`
  const sameYear = from.slice(0, 4) === to.slice(0, 4)
  return `${formatDisplay(from, !sameYear)} – ${formatDisplay(to)}`
}

/** Inclusive day count, for "10 days". */
export function daysBetween(from: string, to: string): number {
  const a = parseDate(from)
  const b = parseDate(to)
  if (!a || !b) return 0
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1
}

const iso = (y: number, m: number, d: number) =>
  `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const fullYear = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y))

export type ParseResult =
  | { value: IsoDate; error?: undefined }
  | { value?: undefined; error: string }

/**
 * Typed text → an ISO date, or a message that says what to fix.
 *
 * Accepts what people actually type: `2026-09-30`, `9/30/2026` (US order, the
 * order the field displays), `Sep 30, 2026`, `30 Sep 2026`, `September 30
 * 2026`. A day that does not exist says so by name — "February has 28 days in
 * 2027" is fixable; "Invalid date" is not.
 */
export function parseTyped(text: string, min?: string, max?: string): ParseResult {
  const t = text.trim()
  if (!t) return { value: null }

  let y: number | undefined
  let m: number | undefined
  let d: number | undefined
  let match: RegExpMatchArray | null

  if ((match = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
    ;[y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  } else if ((match = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/))) {
    ;[m, d, y] = [Number(match[1]), Number(match[2]), fullYear(match[3])]
  } else if ((match = t.match(/^([a-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2}|\d{4})$/i))) {
    m = MONTHS.findIndex((name) => name.startsWith(match![1].toLowerCase())) + 1
    ;[d, y] = [Number(match[2]), fullYear(match[3])]
  } else if ((match = t.match(/^(\d{1,2})\s+([a-z]{3,})\.?,?\s+(\d{2}|\d{4})$/i))) {
    m = MONTHS.findIndex((name) => name.startsWith(match![2].toLowerCase())) + 1
    ;[d, y] = [Number(match[1]), fullYear(match[3])]
  }

  if (!y || !m || !d || m < 1 || m > 12) return { error: 'Enter a date like Sep 30, 2026.' }

  const value = iso(y, m, d)
  if (!parseDate(value)) {
    const days = new Date(y, m, 0).getDate()
    const month = MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1)
    return { error: `${month} has ${days} days in ${y}.` }
  }
  if (min && value < min) return { error: `Choose a date on or after ${formatDisplay(min)}.` }
  if (max && value > max) return { error: `Choose a date on or before ${formatDisplay(max)}.` }
  return { value }
}

const day = (date: Date) => formatDate(date)!
const addDays = (date: Date, n: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)

/** The built-in single-date picks, relative to `today`. */
export function datePresets(today = new Date()): DatePreset[] {
  const quarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0)
  return [
    { label: 'Today', value: day(today) },
    { label: 'Tomorrow', value: day(addDays(today, 1)) },
    { label: 'End of month', value: day(new Date(today.getFullYear(), today.getMonth() + 1, 0)) },
    { label: 'End of quarter', value: day(quarterEnd) },
    { label: 'In 90 days', value: day(addDays(today, 90)) },
  ]
}

/** The built-in range picks, each ending today. */
export function dateRangePresets(today = new Date()): DateRangePreset[] {
  const to = day(today)
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
  return [
    { label: 'Last 7 days', short: '7D', value: { from: day(addDays(today, -6)), to } },
    { label: 'Last 30 days', short: '30D', value: { from: day(addDays(today, -29)), to } },
    { label: 'Last 90 days', short: '90D', value: { from: day(addDays(today, -89)), to } },
    {
      label: 'This month',
      value: { from: day(new Date(today.getFullYear(), today.getMonth(), 1)), to },
    },
    { label: 'This quarter', value: { from: day(quarterStart), to } },
    {
      label: 'Year to date',
      short: 'YTD',
      value: { from: day(new Date(today.getFullYear(), 0, 1)), to },
    },
  ]
}

/**
 * The built-in range picks for a date that lies ahead — a renewal, a due date.
 * "Last 30 days" would be the wrong question there, so these look forward, and
 * `Overdue` is the one pick with no start.
 */
export function upcomingRangePresets(today = new Date()): DateRangePreset[] {
  const from = day(today)
  const quarterStart = Math.floor(today.getMonth() / 3) * 3
  return [
    { label: 'Overdue', short: 'Overdue', value: { from: null, to: day(addDays(today, -1)) } },
    { label: 'Today', value: { from, to: from } },
    { label: 'Next 7 days', short: 'Next 7D', value: { from, to: day(addDays(today, 6)) } },
    { label: 'Next 30 days', short: 'Next 30D', value: { from, to: day(addDays(today, 29)) } },
    {
      label: 'This month',
      value: {
        from: day(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: day(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      },
    },
    {
      label: 'This quarter',
      short: 'Quarter',
      value: {
        from: day(new Date(today.getFullYear(), quarterStart, 1)),
        to: day(new Date(today.getFullYear(), quarterStart + 3, 0)),
      },
    },
  ]
}
