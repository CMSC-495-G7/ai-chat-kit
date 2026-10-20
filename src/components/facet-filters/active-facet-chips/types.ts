import type {
  FacetFiltersLabels,
  CustomFacet,
  FacetGroup,
  FacetQuery,
  FacetSelection,
} from '../types'

export type ActiveFacetChipsProps = {
  groups: FacetGroup[]
  selection: FacetSelection
  queries: FacetQuery[]
  customFacets: CustomFacet[]
  onRemoveValue: (groupKey: string, value: string) => void
  onClearGroup: (groupKey: string) => void
  onRemoveQuery?: (query: FacetQuery) => void
  onRemoveCustom?: (id: string) => void
  onClearAll: () => void
  title: string
  clearAllLabel: string
  emptyHint: string
  /** Chips rendered before "+N more" folds the rest away. */
  maxChips?: number
  collapseAt?: number
  previewLimit?: number
  expandedLimit?: number
  height?: number
  showClearAll?: boolean
  labels?: Partial<FacetFiltersLabels>
}
