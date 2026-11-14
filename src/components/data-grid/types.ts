import type { ReactNode } from 'react'
import type { DataTableLabels, DataTableProps } from '../data-table'
import type { FilterField } from '../filter-panel'

/**
 * One typed condition, shown as a chip.
 *
 * `field` is null for a search across every field. `exact` is set when the
 * value was picked from the data ("Name is Bayshore Financial"); without it the
 * field only has to contain the value ("Name contains bay"). The host filters
 * on both, as it would hand them to an API.
 */
export type FilterTerm = {
  id: string
  field: string | null
  value: string
  exact?: boolean
}

/** A field the search box can narrow to, and find values in. */
export type FilterTermField = {
  key: string
  label: string
  /** A short glyph for the suggestion: `Aa`, `@`. */
  glyph: string
  /** The query parameter narrowing produces. Shown with the suggestion. */
  param: string
}

/** A value from the data that contains what was typed: "Bayshore Financial" in `name`. */
export type FilterMatch = {
  /** A `FilterTermField` key. */
  field: string
  value: string
}

/** A built-in format, or one of the host's own. */
export type ExportFormat = 'csv' | 'json' | { id: string; label: string; hint?: string }

/** Which rows an export covers. `all` means every row that matches, not just this page. */
export type ExportScope = 'selected' | 'all'

export type DataGridLabels = DataTableLabels & {
  filters: string
  /** Heading over values from the data while typing. */
  matches: string
  searchEvery: string
  narrowToField: string
  dates: string
  values: string
  placeholder: string
  /** Placeholder once a chip is in the field. */
  placeholderMore: string
  custom: string
  /** Label for the quick pick of a yes-or-no filter, which has no label column of its own. */
  only: string
  /** The line under the quick picks. */
  quickHint: string
  searchFor: string
  contains: (field: string) => string
  /** The hint beside a value from the data: "in Name". */
  inField: (field: string) => string
  removeFilter: (name: string) => string
  export: string
  /** The button when there is one format and nothing to choose: "Export CSV". */
  exportAs: (format: string) => string
  exportRows: string
  exportSelected: string
  exportAll: string
  /** The bulk bar's export: "Export 2 rows". */
  exportSelection: (n: number) => string
  csvHint: string
  jsonHint: string
  noMatchTitle: string
  noMatchBody: string
  clearAll: string
}

export type DataGridProps<T> = Omit<DataTableProps<T>, 'toolbar' | 'labels'> & {
  /** The search box's accessible name. Nothing draws it. */
  searchLabel: string

  /**
   * Everything that can be filtered, as data. The panel draws it, and so do the
   * chips, the quick picks and the suggestions while typing, so they can never
   * disagree about what a filter is or what it is set to.
   */
  fields?: FilterField[]
  /** Typed conditions: searches, narrowings and values picked from the data. */
  terms?: FilterTerm[]
  /** Omit and the search box only sets `fields`: no free-text search or narrowing. */
  onTermsChange?: (terms: FilterTerm[]) => void
  /** What typing can narrow to and find values in. */
  termFields?: FilterTermField[]
  /**
   * Values from the data that contain the query, for the Matches group. Defaults
   * to looking through `rows` (the page in hand). A grid paged from a server
   * passes a function that asks it, or `false` for no Matches group.
   */
  findMatches?: ((query: string) => FilterMatch[]) | false
  /** Clears the panel's fields. Wired to the panel's Reset and the no-match Clear all. */
  onReset?: () => void

  /** Draws the search box and the Filters button. Defaults to `true`. */
  showSearch?: boolean
  /** Draws the filter panel and the button that opens it. Defaults to `true`. */
  showPanel?: boolean
  /** Whether the panel is showing at first. */
  defaultOpen?: boolean
  /** Whether it starts docked beside the table or floating over it. */
  defaultPinned?: boolean
  onPinnedChange?: (pinned: boolean) => void
  panelTitle?: string

  /**
   * Formats to offer. One format is a plain button ("Export CSV"); two or more,
   * or any selection, make it a menu. Omit for no export.
   */
  exportFormats?: ExportFormat[]
  /**
   * Asked to export. The grid builds no file: the host fetches every matching
   * row (or just the selected ones) and downloads it. `toCsv`, `toJson` and
   * `downloadFile` do that for rows already in hand.
   */
  onExport?: (format: string, scope: ExportScope) => void
  /** How many rows match in all, for the export menu. Defaults to `rows.length`. */
  totalCount?: number
  /** Anything else for the right end of the toolbar, after Export. */
  toolbarEnd?: ReactNode

  labels?: Partial<DataGridLabels>
}
