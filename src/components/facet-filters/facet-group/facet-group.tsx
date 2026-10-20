import { withDefaults } from '../../../lib/withDefaults'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Checkbox } from '../../../primitives/checkbox'
import { IconButton } from '../../../primitives/icon-button'
import { ChevronDownIcon, ChevronRightIcon, SearchIcon, XIcon } from '../../../primitives/icons'
import { FacetRow } from '../facet-row'
import {
  FACET_DENSITY,
  FACET_ROW_HEIGHT,
  FACET_VIRTUALIZE_THRESHOLD,
  isSearchable,
  remainingOf,
  resolveMode,
  selectableOf,
  triState,
} from '../facetRules'
import { DEFAULT_FACET_LABELS } from '../labels'
import { LoadControls } from '../load-controls'
import { useDebounced } from '../useDebounced'
import { useFacetRows } from '../useFacetRows'
import { VirtualFacetList } from '../virtual-facet-list'
import type { FacetGroupSectionProps } from './types'

/**
 * One collapsible group of options.
 *
 * Owns only ephemeral UI state — open, its own search text, whether the dead
 * rows are showing. Selection lives with the host, because the host is what
 * turns it into a request.
 */
export function FacetGroupSection({
  group,
  selected,
  refreshing,
  globalQuery,
  selectAllCap,
  onToggleValue,
  onSetGroup,
  onBulkAdd,
  onAddQuery,
  activeQueries,
  onSearchGroup,
  onLoadMore,
  onLoadAll,
  loadMode = 'button',
  pageSize,
  density = 'comfortable',
  defaultOpen = false,
  showUnavailableToggle = true,
  defaultShowUnavailable = true,
  showSelectionHints = true,
  showSelectAll = true,
  showCounts = true,
  showLoadAll = true,
  showLoadHint = true,
  loadAllWarning,
  layout,
  searchDebounceMs = 150,
  labels: overrides,
}: FacetGroupSectionProps) {
  const spec = withDefaults(FACET_DENSITY[density], layout)
  const labels = withDefaults(DEFAULT_FACET_LABELS, overrides)
  const mode = resolveMode(group)
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [showDead, setShowDead] = useState(group.defaultShowUnavailable ?? defaultShowUnavailable)
  const [expanded, setExpanded] = useState(false)
  const boxRef = useRef<HTMLInputElement | null>(null)

  // The group's own field wins; otherwise the section-wide search drives it,
  // so one query reaches a 20k lookup without a second box to type into.
  const effectiveQuery = query || globalQuery
  const settledQuery = useDebounced(effectiveQuery, searchDebounceMs)

  useEffect(() => {
    if (mode === 'lookup' && onSearchGroup) onSearchGroup(group.key, settledQuery)
  }, [settledQuery, group.key, mode, onSearchGroup])

  // A host answering a lookup has already applied the query; filtering its
  // answer again would drop rows it matched on something we cannot see.
  const serverFiltered = mode === 'lookup' && !!onSearchGroup

  const rows = useFacetRows(group, selected, effectiveQuery, serverFiltered)
  const visible = showDead ? rows : rows.filter((row) => row.available)
  const deadCount = rows.filter((row) => !row.available).length

  const searching = effectiveQuery.trim().length > 0
  // "Show N more" only at rest: with a search running, the matches are the point.
  const capped = mode === 'list' && !expanded && !searching && visible.length > spec.listPreview
  const rendered = capped ? visible.slice(0, spec.listPreview) : visible
  const virtual = rendered.length > FACET_VIRTUALIZE_THRESHOLD

  const total = group.cardinality ?? group.values.length
  const matchCount = group.matchCount ?? rows.length

  // Only wired up when the host opted back into load-on-scroll; otherwise
  // fetching is something the viewer asks for, on a control that names the
  // number it is about to pull.
  const nearEnd = useCallback(() => {
    if (loadMode === 'scroll' && group.hasMore && !group.loading) onLoadMore?.(group.key)
  }, [loadMode, group.hasMore, group.loading, group.key, onLoadMore])

  const viewHeight = Math.max(1, spec.windowRows) * FACET_ROW_HEIGHT

  const remaining = remainingOf(group.loaded ?? group.values.length, group.matchCount)

  // A section-wide search that hit something opens the group on its own —
  // hiding matches behind a caret defeats the point of searching.
  const isOpen = (globalQuery.trim().length > 0 && visible.length > 0) || open

  const state = triState(visible)
  const selectable = selectableOf(visible)
  useEffect(() => {
    if (boxRef.current) boxRef.current.indeterminate = state === 'some'
  }, [state])

  const selectAllLabel =
    state === 'all'
      ? labels.clearSelected(group.label)
      : labels.selectAvailable(selectable.length, group.label)

  function takeAll() {
    if (state === 'all') {
      onSetGroup(group.key, [])
      return
    }
    if (selectable.length > selectAllCap) return
    const values = selectable.map((row) => row.value)
    const picks = new Set(selected)
    const added = values.filter((value) => !picks.has(value))
    onSetGroup(group.key, Array.from(new Set([...selected, ...values])))
    if (added.length > 1) onBulkAdd?.(group.key, added)
  }

  // Enumerating is only offered when every match is actually in hand. Past the
  // cap the honest move is a predicate, not four thousand values in a request.
  const loadedAll = mode === 'list' || !group.hasMore
  const promoted = (activeQueries ?? []).includes(effectiveQuery.trim())
  const canEnumerate = searching && matchCount > 0 && matchCount <= selectAllCap && loadedAll
  const tooMany = searching && matchCount > selectAllCap && !promoted

  const meta = labels.selectedCount(selected.length, total, mode)

  const rowProps = {
    refreshing,
    showCount: showCounts,
    countText: labels.valueCount,
    resultsText: labels.valueResults,
    onToggle: (value: string) => onToggleValue(group.key, value),
  }

  return (
    <div className="border-t border-line pt-1">
      <div className="flex h-8 items-center gap-1.5">
        {showSelectAll &&
          mode === 'list' &&
          (selectable.length <= selectAllCap || state === 'all') && (
            <Checkbox
              ref={boxRef}
              checked={state === 'all'}
              onChange={takeAll}
              aria-label={selectAllLabel}
              title={selectAllLabel}
              className="ml-1"
            />
          )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-control px-1 py-1.5 text-left transition hover:bg-tint/8"
        >
          {isOpen ? (
            <ChevronDownIcon width={13} height={13} className="shrink-0 text-ink-soft" />
          ) : (
            <ChevronRightIcon width={13} height={13} className="shrink-0 text-ink-soft" />
          )}
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink-strong">
            {group.label}
          </span>
          {mode === 'lookup' && (
            <SearchIcon width={11} height={11} className="shrink-0 text-ink-soft" />
          )}
          <span
            className={`shrink-0 text-[10.5px] font-semibold tabular-nums ${
              selected.length ? 'text-brand-fg' : 'text-ink-soft'
            }`}
          >
            {meta}
          </span>
        </button>
        {selected.length > 0 && (
          <IconButton
            size="sm"
            shape="rounded"
            onClick={() => onSetGroup(group.key, [])}
            aria-label={labels.clearGroup(group.label)}
            title={labels.clear}
          >
            <XIcon width={11} height={11} />
          </IconButton>
        )}
      </div>

      {isOpen && (
        <div className="pb-1.5">
          {isSearchable(group, mode) && !globalQuery.trim() && (
            <div className="relative pb-1.5">
              <SearchIcon
                width={12}
                height={12}
                className="pointer-events-none absolute top-2 left-2 text-ink-soft"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={labels.filterOptions(group.label)}
                placeholder={labels.searchPlaceholder(total, mode)}
                className="w-full rounded-control border border-line bg-panel py-1.5 pr-2 pl-7 text-[11.5px] text-ink placeholder:text-ink-soft/70 focus-visible:-outline-offset-2"
              />
            </div>
          )}

          {tooMany && (
            <div className="mb-1.5 rounded-control border border-caution-line bg-caution-surface px-2.5 py-2">
              <p className="text-[11px] leading-relaxed text-ink-soft">
                <strong className="font-semibold text-ink-strong tabular-nums">
                  {labels.matches(matchCount)}
                </strong>{' '}
                {labels.tooManyHint}
              </p>
              {onAddQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onAddQuery?.({
                      groupKey: group.key,
                      query: effectiveQuery.trim(),
                      count: matchCount,
                    })
                    // The predicate is now a chip; leaving the text behind would
                    // keep offering the thing that just happened.
                    setQuery('')
                  }}
                  className="mt-1.5 rounded-control bg-brand-solid px-2.5 py-1 text-[11px] font-semibold text-on-brand-solid"
                >
                  {labels.useSearch}
                </button>
              )}
              {!onAddQuery && (
                <p className="mt-1 text-[11px] text-ink-soft">{labels.narrowSearchHint}</p>
              )}
            </div>
          )}

          {showSelectAll && canEnumerate && (
            <button
              type="button"
              onClick={() => {
                const values = selectable.map((row) => row.value)
                const picks = new Set(selected)
                const added = values.filter((value) => !picks.has(value))
                onSetGroup(group.key, Array.from(new Set([...selected, ...values])))
                if (added.length > 1) onBulkAdd?.(group.key, added)
              }}
              className="mb-1 px-1 text-[11px] font-semibold text-brand-fg transition hover:text-brand-fg-hover"
            >
              {labels.selectAll(matchCount)}
            </button>
          )}

          {showSelectionHints && !searching && selectable.length > selectAllCap && (
            <p className="mb-1 px-2 text-[11px] text-ink-soft">{labels.bulkLimitHint}</p>
          )}

          {group.loading && rendered.length === 0 ? (
            <p className="px-2 py-1.5 text-[11.5px] text-ink-soft">{labels.searching}</p>
          ) : rendered.length === 0 ? (
            <p className="px-2 py-1.5 text-[11.5px] text-ink-soft">
              {mode === 'lookup' && !searching ? labels.lookupEmpty : labels.noMatches}
            </p>
          ) : virtual ? (
            <VirtualFacetList
              rows={rendered}
              label={group.label}
              height={viewHeight}
              keyboardHint={labels.keyboardHint}
              regionLabel={labels.optionsRegion(group.label)}
              refreshing={refreshing}
              showCount={showCounts}
              countText={labels.valueCount}
              resultsText={labels.valueResults}
              resetKey={`${group.key}:${effectiveQuery}`}
              onToggle={rowProps.onToggle}
              onNearEnd={
                loadMode === 'scroll' && group.hasMore && !group.loading ? nearEnd : undefined
              }
            />
          ) : (
            <ul role="list" className="m-0 list-none p-0">
              {rendered.map((row) => (
                <FacetRow key={row.value} row={row} {...rowProps} />
              ))}
            </ul>
          )}

          {loadMode === 'button' && (
            <LoadControls
              remaining={remaining}
              pageSize={pageSize}
              onLoadMore={onLoadMore ? () => onLoadMore(group.key) : undefined}
              onLoadAll={showLoadAll && onLoadAll ? () => onLoadAll(group.key) : undefined}
              showHint={showLoadHint}
              loadAllWarning={loadAllWarning}
              labels={labels}
            />
          )}

          {showSelectionHints && state === 'all' && !group.nullable && selectable.length > 1 && (
            <p className="mt-1 px-2 text-[11px] leading-relaxed text-ink-soft">
              {labels.allSelectedHint(selectable.length, group.label)}
            </p>
          )}

          {capped && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-0.5 px-2 py-1 text-[11.5px] font-semibold text-brand-fg transition hover:text-brand-fg-hover"
            >
              {labels.showMore(visible.length - spec.listPreview)}
            </button>
          )}

          {(group.showUnavailableToggle ?? showUnavailableToggle) && deadCount > 0 && (
            <button
              type="button"
              onClick={() => setShowDead((v) => !v)}
              className="mt-0.5 px-2 py-1 text-[11.5px] font-semibold text-brand-fg transition hover:text-brand-fg-hover"
            >
              {showDead ? labels.hideUnavailable : labels.showUnavailable(deadCount)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
