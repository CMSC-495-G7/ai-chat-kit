import {
  dateRangePresets,
  formatDisplay,
  formatRange,
  upcomingRangePresets,
  type DateRange,
  type DateRangePreset,
} from '../../primitives/date-field'
import type { DateRangeFilterField } from './types'

/** The picks a date field offers: its own list, the built-in set for its direction, or none. */
export function presetsOf(field: DateRangeFilterField, today = new Date()): DateRangePreset[] {
  const { presets } = field
  if (!presets) return []
  if (presets === true) {
    return field.direction === 'future' ? upcomingRangePresets(today) : dateRangePresets(today)
  }
  return presets
}

/** Two ranges are the same pick when both ends match, an open end included. */
export const sameRange = (a: DateRange, b: DateRange) => a.from === b.from && a.to === b.to

/** Whether a range is set at all. */
export const hasRange = (range: DateRange) => Boolean(range.from || range.to)

/** The pick the current range came from, if it still is one. */
export function activePreset(field: DateRangeFilterField, today = new Date()) {
  if (!hasRange(field.value)) return undefined
  return presetsOf(field, today).find((preset) => sameRange(preset.value, field.value))
}

/**
 * What to call the current range: the pick's name, else the dates, else `anyTime`.
 * Dates are kept short for a narrow row, so the year is left off a range that
 * starts and ends in the current one: "Jul 11 – Oct 8", not "Jul 11 – Oct 8, 2026".
 */
export function describeRange(field: DateRangeFilterField, anyTime: string, today = new Date()) {
  const { from, to } = field.value
  if (!hasRange(field.value)) return anyTime
  const preset = activePreset(field, today)
  if (preset) return preset.label
  const thisYear = String(today.getFullYear())
  if (from && to && from.startsWith(thisYear) && to.startsWith(thisYear)) {
    return from === to
      ? formatDisplay(from, false)
      : `${formatDisplay(from, false)} – ${formatDisplay(to, false)}`
  }
  if (from && to) return formatRange(field.value)
  return to ? `Up to ${formatDisplay(to)}` : `From ${formatDisplay(from)}`
}
