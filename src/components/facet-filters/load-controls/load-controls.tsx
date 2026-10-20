import { withDefaults } from '../../../lib/withDefaults'
import { FACET_PAGE_SIZE } from '../facetRules'
import { DEFAULT_FACET_LABELS } from '../labels'
import type { LoadControlsProps } from './types'

/**
 * The two ways to get more of a paged list, both on a button that names its
 * number.
 *
 * The host supplies paging callbacks and labels; this helper only presents
 * them. It lives separately so the group component reads as layout.
 *
 * Payload size belongs to the host. `loadAllWarning` supplies an honest
 * endpoint-specific estimate; no byte cost is invented when it is omitted.
 */
export function LoadControls({
  remaining,
  pageSize = FACET_PAGE_SIZE,
  onLoadMore,
  onLoadAll,
  showHint = true,
  loadAllWarning,
  labels: overrides,
}: LoadControlsProps) {
  if (remaining <= 0 || !(onLoadMore || onLoadAll)) return null
  const labels = withDefaults(DEFAULT_FACET_LABELS, overrides)
  const warning = loadAllWarning?.(remaining)
  const heavy = !!warning

  return (
    <div className="mt-1.5">
      <div className="flex gap-1.5">
        {onLoadMore && (
          <button
            type="button"
            onClick={onLoadMore}
            className="flex-1 rounded-control border border-line bg-panel-solid px-2 py-1.5 text-[11.5px] font-semibold text-ink-strong transition hover:bg-tint/8"
          >
            {labels.loadMore(Math.min(pageSize, remaining))}
          </button>
        )}
        {onLoadAll && (
          <button
            type="button"
            onClick={onLoadAll}
            className={`flex-1 rounded-control px-2 py-1.5 text-[11.5px] font-semibold transition ${
              heavy ? 'bg-caution-surface text-caution' : 'bg-chip text-chip-fg hover:bg-chip-hover'
            }`}
          >
            {labels.loadAll(remaining)}
          </button>
        )}
      </div>
      {showHint && (
        <p
          className={`mt-1 px-0.5 text-[10.5px] leading-snug ${heavy ? 'text-caution' : 'text-ink-soft'}`}
        >
          {warning ?? labels.loadHint(remaining)}
        </p>
      )}
    </div>
  )
}
