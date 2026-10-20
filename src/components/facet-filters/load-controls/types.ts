import type { FacetFiltersLabels } from '../types'

export type LoadControlsProps = {
  /** Values that exist but have not been fetched. Nothing renders at zero. */
  remaining: number
  /**
   * What one "more" actually fetches — the host's page size. The label is a
   * promise, so it has to come from whoever keeps it.
   */
  pageSize?: number
  onLoadMore?: () => void
  onLoadAll?: () => void
  showHint?: boolean
  /** Optional host estimate. The library cannot know an endpoint's payload cost. */
  loadAllWarning?: (remaining: number) => string | null
  labels?: Partial<Pick<FacetFiltersLabels, 'loadMore' | 'loadAll' | 'loadHint'>>
}
