import { singularOf } from './facetRules'
import type { FacetFiltersLabels } from './types'

/** English defaults; hosts can replace strings and count-aware formatters. */
export const DEFAULT_FACET_LABELS: Required<FacetFiltersLabels> = {
  title: 'Filters',
  addSectionTitle: 'Add a facet',
  addButton: 'Add facet',
  activeTitle: 'Active',
  clearAll: 'Clear all',
  findPlaceholder: 'Find a filter…',
  emptyHint: 'No filters yet. Answers draw from everything in scope.',
  scopeNote: 'Applies to every group below.',
  reset: 'Reset',
  retry: 'Retry',
  done: 'Done',
  appliedHint: 'Applied as you tick',
  facetType: 'Facet type',
  facetValue: 'Facet value',
  clear: 'Clear',
  hideUnavailable: 'Hide unavailable',
  searching: 'Searching…',
  lookupEmpty: 'Type to search this group.',
  noMatches: 'Nothing here matches that.',
  bulkLimitHint: 'Search to narrow these options before selecting all.',
  tooManyHint: '— too many to carry as individual values.',
  narrowSearchHint: 'Narrow your search to select individual matches.',
  useSearch: 'Filter by this search instead',
  moreFiltersHint: 'More filters are active. Review their groups below.',
  optionsRegion: (label) => `${label} options`,
  valueCount: (n) => (typeof n === 'number' ? n.toLocaleString() : '—'),
  valueResults: (n) => `, ${n.toLocaleString()} results`,
  activeCount: (n) => String(n),
  moreChips: (n) => `+${n} more`,
  keyboardHint:
    'Use arrow keys to move between options, Home and End to jump, and Space to select.',
  itemsInScope: (n) => `${n.toLocaleString()} items in scope`,
  filterOptions: (label) => `Filter ${label} options`,
  searchPlaceholder: (n, mode) =>
    mode === 'lookup'
      ? `Search ${n.toLocaleString()} values`
      : `Filter ${n.toLocaleString()} options`,
  clearGroup: (label) => `Clear ${label} filters`,
  clearSelected: (label) => `Clear all ${label} filters`,
  selectAvailable: (n, label) => `Select all ${n} available in ${label}`,
  selectedCount: (picked, total, mode) =>
    picked
      ? mode === 'lookup'
        ? `${picked.toLocaleString()} picked`
        : `${picked.toLocaleString()} of ${total.toLocaleString()}`
      : total.toLocaleString(),
  matches: (n) => `${n.toLocaleString()} matches`,
  selectAll: (n) => `Select all ${n.toLocaleString()}`,
  showMore: (n) => `Show ${n.toLocaleString()} more`,
  showUnavailable: (n) => `Show ${n} unavailable`,
  allSelectedHint: (n, label) =>
    `All ${n} selected. Items with no ${singularOf(label)} stay excluded — this is not the same as clearing the group.`,
  bulkAdded: (n) => `${n.toLocaleString()} added in one go.`,
  undo: 'Undo',
  groupSummary: (label, picked, total) =>
    `${label} · ${picked.toLocaleString()} of ${total.toLocaleString()}`,
  chipPreviewHint: (limit, label) =>
    `First ${limit} selected values shown. Review or search ${label} below to change other selections.`,
  removeValue: (group, value) => `Remove the ${group} ${value} filter`,
  queryPrefix: (label) => `${label} contains`,
  removeQuery: (query) => `Remove the ${query} search filter`,
  removeCustom: (type, value) => `Remove the ${type} ${value} filter`,
  loadMore: (n) => `Load ${n.toLocaleString()} more`,
  loadAll: (n) => `Load all ${n.toLocaleString()}`,
  loadHint: (n) => `${n.toLocaleString()} more to fetch.`,
}
