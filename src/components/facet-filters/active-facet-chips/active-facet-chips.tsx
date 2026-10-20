import { withDefaults } from '../../../lib/withDefaults'
import { useMemo, useState } from 'react'
import { FilterChip } from '../../../primitives/filter-chip'
import { ChevronDownIcon } from '../../../primitives/icons'
import { FACET_CHIP_COLLAPSE_AT, resolveMode } from '../facetRules'
import { DEFAULT_FACET_LABELS } from '../labels'
import type { FacetGroup } from '../types'
import type { ActiveFacetChipsProps } from './types'

/**
 * Everything currently narrowing the answer, in one strip.
 *
 * Three chip shapes, because they are three different promises. A solid chip
 * is a value the index vouched for. A dark chip is a predicate — "Loan
 * contains 1772" — standing in for a selection too large to enumerate. A
 * dashed chip is something the viewer typed that the index never offered.
 *
 * Every chip that needs one names its field: `Merchant: Delta Air Lines`. A
 * hand-entered chip always does, because the field is the thing the reader
 * cannot otherwise work out; a facet chip does it only when its label appears
 * in more than one group, since this data really has a Payroll account and a
 * Payroll category and two identical chips is a bug report waiting to happen.
 */
export function ActiveFacetChips({
  groups,
  selection,
  queries,
  customFacets,
  onRemoveValue,
  onClearGroup,
  onRemoveQuery,
  onRemoveCustom,
  onClearAll,
  title,
  clearAllLabel,
  emptyHint,
  maxChips = 24,
  collapseAt = FACET_CHIP_COLLAPSE_AT,
  previewLimit = 20,
  expandedLimit = 100,
  height,
  showClearAll = true,
  labels: overrides,
}: ActiveFacetChipsProps) {
  const labels = withDefaults(DEFAULT_FACET_LABELS, overrides)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)

  const indexes = useMemo(() => {
    const labels = new Map<string, Map<string, string>>()
    const seen = new Map<string, Set<string>>()
    for (const group of groups) {
      const local = resolveMode(group) === 'list'
      const values = new Map<string, string>()
      for (const value of group.values) {
        const label = value.label ?? value.value
        values.set(value.value, label)
        if (local) {
          const keys = seen.get(label) ?? new Set<string>()
          keys.add(group.key)
          seen.set(label, keys)
        }
      }
      labels.set(group.key, values)
    }
    return { labels, ambiguous: (label: string) => (seen.get(label)?.size ?? 0) > 1 }
  }, [groups])

  const picked = groups
    .map((group) => ({ group, values: selection[group.key] ?? [] }))
    .filter((entry) => entry.values.length > 0)

  const count =
    picked.reduce((sum, entry) => sum + entry.values.length, 0) +
    queries.length +
    customFacets.length

  const regionHeight = height ?? (maxChips <= 4 ? 80 : 112)
  if (count === 0)
    return (
      <div style={{ height: regionHeight }} className="shrink-0">
        <p className="py-1 text-[11.5px] text-ink-soft">{emptyHint}</p>
      </div>
    )

  function labelFor(group: FacetGroup, value: string) {
    return indexes.labels.get(group.key)?.get(value) ?? value
  }

  // Build at most the visible budget, rather than thousands of JSX elements
  // and only then slicing them. Expansion is bounded independently of selection.
  const budget = Math.max(
    1,
    Math.floor(showAll ? expandedLimit : Math.min(maxChips, expandedLimit)),
  )
  let chipCount = 0
  const chips: React.ReactNode[] = []
  function addChip(render: () => React.ReactNode) {
    if (chipCount < budget) chips.push(render())
    chipCount += 1
  }

  for (const { group, values } of picked) {
    const summarized = values.length >= Math.max(1, collapseAt)
    const expanded = expandedGroups.includes(group.key)
    if (summarized) {
      addChip(() => (
        <div key={group.key} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setExpandedGroups((keys) =>
                expanded ? keys.filter((key) => key !== group.key) : [...keys, group.key],
              )
            }
            aria-expanded={expanded}
            className="flex items-center gap-1 rounded-control bg-chip py-1 pr-2 pl-2.5 text-[11.5px] font-semibold text-chip-fg transition hover:bg-chip-hover"
          >
            {labels.groupSummary(
              group.label,
              values.length,
              group.cardinality ?? group.values.length,
            )}
            <ChevronDownIcon width={11} height={11} />
          </button>
          <button
            type="button"
            onClick={() => onClearGroup(group.key)}
            aria-label={labels.clearGroup(group.label)}
            className="px-1 text-[11px] font-semibold text-brand-fg"
          >
            {labels.clear}
          </button>
        </div>
      ))
      if (!expanded) continue
    }
    for (const value of values.slice(0, summarized ? previewLimit : values.length)) {
      addChip(() => {
        const label = labelFor(group, value)
        return (
          <FilterChip
            key={`${group.key}:${value}`}
            tone="value"
            prefix={indexes.ambiguous(label) ? group.label : undefined}
            label={label}
            onRemove={() => onRemoveValue(group.key, value)}
            removeLabel={labels.removeValue(group.label, label)}
          />
        )
      })
    }
    if (summarized && expanded && values.length > previewLimit) {
      addChip(() => (
        <p key={`${group.key}:preview`} className="w-full text-[11px] text-ink-soft">
          {labels.chipPreviewHint(previewLimit, group.label)}
        </p>
      ))
    }
  }

  for (const query of queries) {
    const group = groups.find((candidate) => candidate.key === query.groupKey)
    addChip(() => (
      <FilterChip
        key={`${query.groupKey}:${query.query}`}
        tone="query"
        prefix={labels.queryPrefix(group?.label ?? query.groupKey)}
        label={query.query}
        count={typeof query.count === 'number' ? query.count : undefined}
        onRemove={onRemoveQuery ? () => onRemoveQuery(query) : undefined}
        removeLabel={labels.removeQuery(query.query)}
      />
    ))
  }

  for (const facet of customFacets) {
    addChip(() => (
      <FilterChip
        key={facet.id}
        tone="custom"
        prefix={facet.type}
        label={facet.value}
        onRemove={onRemoveCustom ? () => onRemoveCustom(facet.id) : undefined}
        removeLabel={labels.removeCustom(facet.type, facet.value)}
      />
    ))
  }

  const overflow = chipCount > budget

  return (
    <div style={{ height: regionHeight }} className="flex min-h-0 shrink-0 flex-col">
      <div className="mb-1.5 shrink-0 flex items-baseline gap-2">
        <p className="flex-1 text-[10px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
          {title} · {labels.activeCount(count)}
        </p>
        {showClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-semibold text-brand-fg transition hover:text-brand-fg-hover"
          >
            {clearAllLabel}
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-wrap content-start gap-1.5 overflow-y-auto">
        {chips}
        {overflow && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-control bg-panel px-2 py-1 text-[11px] font-semibold text-brand-fg transition hover:text-brand-fg-hover"
          >
            {labels.moreChips(chipCount - budget)}
          </button>
        )}
        {overflow && showAll && (
          <p className="w-full text-[11px] text-ink-soft">{labels.moreFiltersHint}</p>
        )}
      </div>
    </div>
  )
}
