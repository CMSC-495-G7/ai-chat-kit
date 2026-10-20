import type { FacetDensitySpec } from './facetRules'

/**
 * The facet-filter data contract.
 *
 * Everything here is *given* to the component: it fetches nothing, counts
 * nothing and stores nothing. That is what makes it portable — a host with a
 * `/facets` endpoint, a host with a local array, and Storybook all satisfy the
 * same props: the host owns the selection, because the host is what turns it
 * into a request.
 */

/** One selectable value in a group. */
export type FacetValue = {
  value: string
  /** Shown instead of `value`. Identifiers (loan numbers) usually have none. */
  label?: string
  /**
   * Items that would remain if this value were added to the current selection.
   * `null` means "the endpoint could not tell us" — rendered as an em dash, not
   * as a zero. A zero is a claim; an unknown is not.
   */
  count?: number | null
}

/**
 * `list` searches loaded values locally; `lookup` asks the host for results.
 * Both virtualize long results. Defaults to list unless paging metadata is
 * present. Cardinality never forces a fully loaded list into remote lookup.
 */
export type FacetGroupMode = 'list' | 'lookup'

export type FacetGroup = {
  key: string
  label: string
  /** Loaded values. For a lookup group this is the current page of results. */
  values: FacetValue[]
  /** Total distinct values in the index — shown in the header. */
  cardinality?: number
  mode?: FacetGroupMode
  /**
   * The field can be empty on an item. Adds a trailing "No <label>" row, which
   * is what lets "select all" genuinely mean all: ticking every value is a set
   * membership test, and null is not in the set.
   */
  nullable?: boolean
  /** Sentinel sent in the selection for the "no value" row. */
  nullValue?: string
  nullLabel?: string
  /** Force the in-group search field on or off, overriding the threshold. */
  searchable?: boolean
  /** Override the panel default for this group. */
  showUnavailableToggle?: boolean
  defaultShowUnavailable?: boolean
  /** Override the density default for initial expansion. */
  defaultOpen?: boolean
  /**
   * Total matches for the query the host last answered, when that is larger
   * than `values` (a paged lookup group). Select-all reads this, not the
   * length of the page in front of it.
   */
  matchCount?: number
  /** This group's values are in flight. */
  loading?: boolean
  /**
   * How many options the host has actually fetched for this group. Defaults
   * to `values.length`, which is close enough unless pinned selections are
   * travelling with the page. `matchCount - loaded` is what the load controls
   * offer, so an honest number here is what keeps them from lying.
   */
  loaded?: number
  /** More pages exist behind `onLoadMore` / `onLoadAll` (lookup groups). */
  hasMore?: boolean
}

/** groupKey → selected values. Absent or empty means the group is unconstrained. */
export type FacetSelection = Record<string, string[]>

/**
 * A predicate standing in for a selection too large to enumerate — "every loan
 * number containing 1772". Survives a shared link and stays correct as new
 * values land, which a frozen list of 4,000 ids does not.
 */
export type FacetQuery = {
  groupKey: string
  query: string
  count?: number | null
}

/** A value the viewer typed that the facet index did not offer. */
export type CustomFacet = {
  id: string
  type: string
  value: string
}

/**
 * A single-valued, always-applied parameter — a date range, a currency, a
 * region. Deliberately *not* a facet: its counts are cumulative rather than
 * disjoint, so listing it among the checkbox groups teaches people that one
 * row is exclusive while its neighbours are not.
 */
export type FacetScope = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export type FacetFiltersLabels = {
  title: string
  addSectionTitle: string
  addButton: string
  activeTitle: string
  clearAll: string
  findPlaceholder: string
  emptyHint: string
  scopeNote: string
  reset?: string
  retry?: string
  done?: string
  appliedHint?: string
  facetType?: string
  facetValue?: string
  clear?: string
  hideUnavailable?: string
  searching?: string
  lookupEmpty?: string
  noMatches?: string
  bulkLimitHint?: string
  tooManyHint?: string
  narrowSearchHint?: string
  useSearch?: string
  moreFiltersHint?: string
  keyboardHint?: string
  optionsRegion?: (label: string) => string
  activeCount?: (count: number) => string
  valueCount?: (count: number | null | undefined) => string
  valueResults?: (count: number) => string
  moreChips?: (count: number) => string
  itemsInScope?: (count: number) => string
  filterOptions?: (label: string) => string
  searchPlaceholder?: (count: number, mode: FacetGroupMode) => string
  clearGroup?: (label: string) => string
  selectAvailable?: (count: number, label: string) => string
  clearSelected?: (label: string) => string
  selectedCount?: (picked: number, total: number, mode: FacetGroupMode) => string
  matches?: (count: number) => string
  selectAll?: (count: number) => string
  showMore?: (count: number) => string
  showUnavailable?: (count: number) => string
  allSelectedHint?: (count: number, label: string) => string
  bulkAdded?: (count: number) => string
  undo?: string
  groupSummary?: (label: string, picked: number, total: number) => string
  chipPreviewHint?: (limit: number, label: string) => string
  removeValue?: (group: string, value: string) => string
  queryPrefix?: (label: string) => string
  removeQuery?: (query: string) => string
  removeCustom?: (type: string, value: string) => string
  loadMore?: (count: number) => string
  loadAll?: (count: number) => string
  loadHint?: (remaining: number) => string
}

export type FacetFiltersProps = {
  groups: FacetGroup[]
  selection: FacetSelection
  onSelectionChange: (next: FacetSelection) => void

  /** Items matching the whole selection. Rendered in the header. */
  total?: number | null
  /** Counts are being refetched: numbers blank to a bar, rows stay clickable. */
  refreshing?: boolean
  /** The facet call failed. Counts become em dashes and this shows with Retry. */
  error?: string | null
  onRetry?: () => void

  /** Rendered above the groups, beside the total it governs. */
  scope?: FacetScope

  /** Section one. Omit `facetTypes` to hide the whole add-a-facet block. */
  facetTypes?: string[]
  customFacets?: CustomFacet[]
  onAddCustomFacet?: (facet: { type: string; value: string }) => void
  onRemoveCustomFacet?: (id: string) => void
  /** Per-type placeholder and hint for the value field. */
  describeFacetType?: (type: string) => { placeholder?: string; hint?: string }

  /** Query chips produced when a select-all exceeds `selectAllCap`. */
  queries?: FacetQuery[]
  onAddQuery?: (query: FacetQuery) => void
  onRemoveQuery?: (query: FacetQuery) => void

  /**
   * Called (debounced) with a lookup group's current query. The host answers by
   * replacing that group's `values`. Without it, lookup groups filter only what
   * is already loaded.
   */
  onSearchGroup?: (groupKey: string, query: string) => void
  /** Fetch one more page of a group's values. */
  onLoadMore?: (groupKey: string) => void
  /** Fetch everything a group has left, in one call. */
  onLoadAll?: (groupKey: string) => void
  /**
   * How many values one `onLoadMore` fetches. Shown on the button, so it has
   * to be the number your endpoint actually pages at. Defaults to
   * FACET_PAGE_SIZE.
   */
  pageSize?: number
  /**
   * `button` (the default) puts loading on explicit controls that name the
   * number. `scroll` restores load-on-scroll for hosts that want it — it
   * hijacks the gesture the rail already needs and hides how much is left,
   * which is why it is not what everyone inherits.
   */
  loadMode?: 'button' | 'scroll'

  onClearAll?: () => void

  /** Maximum enumerated bulk selection in any group; larger searches offer a query when supported. */
  selectAllCap?: number

  /**
   * `compact` is the widget's panel: fewer groups open, shorter previews, a
   * smaller window, chips capped. Nothing shrinks. Pick it from panel height,
   * not width — see FACET_DENSITY.
   */
  density?: 'comfortable' | 'compact'
  /**
   * The collapsible "Filters" row. Off when the host already draws a header
   * for this panel, as the widget's side-tab chrome does.
   */
  showHeader?: boolean
  /**
   * Renders the footer bar. Given when the panel covers the thing it filters
   * and needs a way out — the widget and the phone sheet, not the side rail.
   * Filters still apply on tick; this only dismisses.
   */
  onDone?: () => void

  /** Section header state. Uncontrolled when `open` is omitted. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void

  /** The sidebar is a slim icon rail: render the entry point only. */
  railCollapsed?: boolean
  /** Clicking the collapsed entry point should expand the rail. */
  onExpandRail?: () => void

  /** Show the search across all groups. Per-group search uses group.searchable. */
  showSearch?: boolean
  showActiveFilters?: boolean
  showTotal?: boolean
  /** Hide row counts without changing availability or selection semantics. */
  showCounts?: boolean
  showReset?: boolean
  showClearAll?: boolean
  /** Hide the control without changing whether zero-count rows are shown. */
  showUnavailableToggle?: boolean
  /** Initial zero-count row visibility; selected rows always remain available. */
  defaultShowUnavailable?: boolean
  showSelectionHints?: boolean
  showSelectAll?: boolean
  showLoadAll?: boolean
  showLoadHint?: boolean
  /** Optional host estimate instead of a guessed option payload size. */
  loadAllWarning?: (remaining: number) => string | null
  /** Override density defaults without changing row size or virtualization. */
  layout?: Partial<FacetDensitySpec>
  /** Debounce for host lookup searches, in milliseconds. Default 150. */
  searchDebounceMs?: number
  /** Active selection presentation; bounds apply before creating chip elements. */
  chipOptions?: {
    collapseAt?: number
    previewLimit?: number
    expandedLimit?: number
    /** Fixed scrollable region in pixels. Defaults to 112, or 80 in compact density. */
    height?: number
  }
  labels?: Partial<FacetFiltersLabels>
  className?: string
}
