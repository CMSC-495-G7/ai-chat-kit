import type { FacetDensity, FacetDensitySpec } from '../facetRules'
import type { FacetFiltersLabels, FacetGroup, FacetQuery } from '../types'

export type FacetGroupSectionProps = {
  group: FacetGroup
  selected: string[]
  refreshing: boolean
  /** The section-wide "find a filter" text. Opens matching groups. */
  globalQuery: string
  selectAllCap: number
  onToggleValue: (groupKey: string, value: string) => void
  /** Bulk replace — select-all and clear both go through here. */
  onSetGroup: (groupKey: string, values: string[]) => void
  /** Reported so the section can offer Undo on a bulk select. */
  onBulkAdd?: (groupKey: string, values: string[]) => void
  onAddQuery?: (query: FacetQuery) => void
  /** Queries already promoted to chips for this group, so the offer is not repeated. */
  activeQueries?: string[]
  /** Must be referentially stable — it runs in an effect on every query change. */
  onSearchGroup?: (groupKey: string, query: string) => void
  onLoadMore?: (groupKey: string) => void
  onLoadAll?: (groupKey: string) => void
  loadMode?: 'button' | 'scroll'
  /** The host's page size, so "Load N more" names a number it honours. */
  pageSize?: number
  density?: FacetDensity
  defaultOpen?: boolean
  showUnavailableToggle?: boolean
  defaultShowUnavailable?: boolean
  showSelectionHints?: boolean
  showSelectAll?: boolean
  showCounts?: boolean
  showLoadAll?: boolean
  showLoadHint?: boolean
  loadAllWarning?: (remaining: number) => string | null
  layout?: Partial<FacetDensitySpec>
  searchDebounceMs?: number
  labels?: Partial<FacetFiltersLabels>
}
