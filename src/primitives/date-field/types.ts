import type { DatePickerProps } from '../date-picker'
import type { ParseResult } from './date-text'

/** ISO `YYYY-MM-DD`, or null for "not set". Local calendar dates, never UTC. */
export type IsoDate = string | null

export type DateRange = { from: IsoDate; to: IsoDate }

/** A named date — "End of month". */
export type DatePreset = { label: string; value: IsoDate }

/** A named range — "Last 30 days". */
export type DateRangePreset = {
  label: string
  value: DateRange
  /**
   * A label for a tight control — `30D` for "Last 30 days". Optional: a pick
   * without one is simply left out of controls that only have room for short
   * labels, and still appears wherever the full label fits.
   */
  short?: string
}

export type DateFieldLabels = {
  openCalendar: string
  closeCalendar: string
  quickPicks: string
  pickDate: string
  typedDate: string
  dateRange: string
  days: (count: number) => string
}

type Shared = {
  labels?: Partial<DateFieldLabels>
  /** Labels and locales passed through to the calendar. */
  calendarProps?: Pick<DatePickerProps, 'labels' | 'locale' | 'displayLocale'>
  /** Names the field. Visually hidden unless `showLabel`. */
  label: string
  /** Earliest selectable date, YYYY-MM-DD inclusive. */
  min?: string
  /** Latest selectable date, YYYY-MM-DD inclusive. */
  max?: string
  disabled?: boolean
  /**
   * A message from the host's own validation — "Renewal must be after the
   * start date". Shown under the field and wired as its description; the
   * field's own parse errors show the same way.
   */
  error?: string
  /** Shown while empty. */
  placeholder?: string
  className?: string
}

export type DateFieldProps = Shared & {
  /** Defaults to `false`: in a toolbar the field usually has a visible label elsewhere. */
  showLabel?: boolean
  value: IsoDate
  /** Pair a custom formatter with a parser accepting the same display format. */
  formatValue?: (value: IsoDate) => string
  parseValue?: (text: string, min?: string, max?: string) => ParseResult
  onChange: (value: IsoDate) => void
  /**
   * Quick picks, for a field in a tight space. Given, the field shows the
   * matching preset as a chip ("End of month") with its date beside it, and
   * the calendar opens with the picks alongside. `true` uses the built-in
   * relative set (`datePresets()`); pass your own list to replace it.
   * Without presets the field takes typed dates as well as the calendar.
   */
  presets?: boolean | DatePreset[]
  id?: string
}

export type DateRangeFieldProps = Shared & {
  /** Defaults to `true`. */
  showLabel?: boolean
  value: DateRange
  formatValue?: (value: DateRange) => string
  showDayCount?: boolean
  onChange: (value: DateRange) => void
  /**
   * Quick picks — "Last 30 days", "This quarter". The field then leads with
   * the matching preset's name, which says what a range *means* in far less
   * width than two dates. `true` uses `dateRangePresets()`; for a date that lies
   * ahead, pass `upcomingRangePresets()`.
   */
  presets?: boolean | DateRangePreset[]
  id?: string
}
