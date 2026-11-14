import type { ReactNode } from 'react'
import type {
  DateFieldProps,
  DateRange,
  DateRangeFieldProps,
  IsoDate,
} from '../../primitives/date-field'

type Base = {
  id: string
  label: string
  /** Shown under the label — say what the filter means, not how to use it. */
  hint?: ReactNode
}

export type StringFilterField = Base & {
  type: 'string'
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export type FilterOption = {
  value: string
  label: string
  /** How many rows this option would match. Omit when unknown — never fake it. */
  count?: number
}

export type OptionsFilterField = Base & {
  type: 'options'
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
  /**
   * Many-of (checkboxes) or one-of (a select). Defaults to many.
   *
   * Large multiple-choice lists scroll; cardinality never changes the
   * selection contract to single choice. For thousands of values use FacetFilters.
   */
  multiple?: boolean
  /** Option count above which a multi-choice list becomes scrollable. Default 8. */
  selectThreshold?: number
  emptyLabel?: string
}

export type BooleanFilterField = Base & {
  type: 'boolean'
  value: boolean
  onChange: (value: boolean) => void
}

export type DateFilterField = Base & {
  type: 'date'
  value: IsoDate
  onChange: (value: IsoDate) => void
  min?: string
  max?: string
  /** Quick picks instead of typing — see `DateField`'s `presets`. */
  presets?: DateFieldProps['presets']
}

export type DateRangeFilterField = Base & {
  type: 'dateRange'
  value: DateRange
  onChange: (value: DateRange) => void
  min?: string
  max?: string
  /**
   * Quick picks — "Last 30 days". Worth it in the rail, where a named range
   * fits and two dates barely do. They show as a grid of toggles above the
   * exact range; picking the one that is already on clears it. `true` takes
   * the built-in set for `direction`. Omit for typed dates and a calendar only.
   */
  presets?: DateRangeFieldProps['presets']
  /**
   * Which way this date points. A created or updated date lies behind
   * ("Last 30 days"); a due or renewal date lies ahead ("Overdue", "Next 7
   * days"). It only chooses the built-in picks when `presets` is `true`.
   * Defaults to `past`.
   */
  direction?: 'past' | 'future'
}

export type FilterField =
  | StringFilterField
  | OptionsFilterField
  | BooleanFilterField
  | DateFilterField
  | DateRangeFilterField

export type FilterPanelLabels = {
  reset: string
  close: string
  pin: string
  unpin: string
  any: string
  clearField: (label: string) => string
  /** Heading over several date fields, which share one section. */
  dates: string
  /** What a date row says while no range is set. */
  anyTime: string
}

export type FilterPanelProps = {
  labels?: Partial<FilterPanelLabels>
  fields: FilterField[]
  title?: string
  /** Count shown beside the title. Omit to hide it. */
  activeCount?: number
  onReset?: () => void

  /**
   * Docked beside the table rather than floating over it.
   *
   * The same panel in both places on purpose: a floating panel and a docked
   * rail that merely resemble each other drift apart, and then a field added
   * to one is missing from the other.
   */
  pinned?: boolean
  onPinnedChange?: (pinned: boolean) => void
  /** Only meaningful while floating. */
  onClose?: () => void

  /**
   * Which date row is open, by field id, when there are two or more date
   * fields. Controlled so a host can open one on purpose — a "Custom range"
   * button elsewhere that lands you on its dates. Omit and the panel opens the
   * first row that has a range, else the first.
   */
  expandedDate?: string
  onExpandedDateChange?: (id: string) => void
  /**
   * A strip along the bottom edge, set off by a rule: a link to another way of
   * filtering, a count of what matches. Left to the host.
   */
  footer?: ReactNode
  /**
   * `card` (the default) is a bordered box that sizes to its fields. `fill`
   * has no frame of its own and fills its parent's height: a header band, a
   * field list that scrolls, and the footer band pinned to the bottom. It is
   * how `DataGrid` docks the panel as its first column, as tall as the table.
   */
  layout?: 'card' | 'fill'
  className?: string
}
