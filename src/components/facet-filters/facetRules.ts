import type { FacetGroup, FacetValue } from './types'

/**
 * Presentation limits. Loading strategy is chosen by the host, independently
 * of cardinality; large local lists are virtualized just like remote pages.
 */

/** Below this many values a filter field costs more than it saves. */
export const FACET_SEARCH_THRESHOLD = 8
/** @deprecated Cardinality no longer chooses loading strategy. Retained for hosts. */
export const FACET_LOOKUP_THRESHOLD = 2000
/** Select-all past this many values offers a query chip instead. */
export const FACET_SELECT_ALL_CAP = 500
/** Past this many rendered rows the group switches to a virtual window. */
export const FACET_VIRTUALIZE_THRESHOLD = 40
/** Fixed so the window needs no measuring pass. Matches the rendered row. */
export const FACET_ROW_HEIGHT = 32
/** Selections in one group past this render as a single expandable chip. */
export const FACET_CHIP_COLLAPSE_AT = 3
/**
 * Default page for a lookup group. Only a default: the host pages however its
 * endpoint pages, and says so through `pageSize` so the button's number is
 * one the host actually honours.
 */
export const FACET_PAGE_SIZE = 500
/** Rough wire cost of one option: value, count and JSON overhead. */
export const FACET_OPTION_BYTES = 56
/**
 * Where Load all starts warning rather than just reporting.
 *
 * Measured in bytes, not options, because the payload is what the viewer
 * actually pays. A count threshold cried wolf at 1,490 loan numbers — 81 KB,
 * which nobody needs advice about — and would have stayed silent for a group
 * of long labels a fifth the length.
 */
export const FACET_LOAD_ALL_HEAVY_BYTES = 256 * 1024

export function isHeavyLoad(remaining: number): boolean {
  return remaining * FACET_OPTION_BYTES > FACET_LOAD_ALL_HEAVY_BYTES
}

export type FacetDensity = 'comfortable' | 'compact'

export type FacetDensitySpec = {
  /** Rows shown before "Show N more" in a list group. */
  listPreview: number
  /** Rows the virtual window mounts. */
  windowRows: number
  /** Groups expanded on first render. */
  groupsOpen: number
  /** Chips rendered before "+N more". */
  maxChips: number
}

/**
 * Compact exists for the widget, whose Filters panel has roughly 530px of
 * scroll and covers the conversation while it is open.
 *
 * Every difference is a count or a default. Nothing gets smaller — the row
 * stays 32, the type stays put — because shrinking targets to win forty
 * pixels is how a compact mode becomes the one nobody uses. Density follows
 * panel HEIGHT, not width: the expanded widget is wide *and* tall, and takes
 * the roomy defaults back.
 */
export const FACET_DENSITY: Record<FacetDensity, FacetDensitySpec> = {
  comfortable: { listPreview: 8, windowRows: 9, groupsOpen: 2, maxChips: 24 },
  compact: { listPreview: 3, windowRows: 6, groupsOpen: 1, maxChips: 4 },
}

export function windowHeight(density: FacetDensity): number {
  return FACET_DENSITY[density].windowRows * FACET_ROW_HEIGHT
}

/** What a group still has to fetch, given what the host has handed over. */
export function remainingOf(loaded: number, matchCount: number | undefined): number {
  if (typeof matchCount !== 'number') return 0
  return Math.max(0, matchCount - loaded)
}

/** "about 1.1 MB" — informed rather than brave. */
export function weightOf(count: number): string {
  const bytes = count * FACET_OPTION_BYTES
  if (bytes < 1024 * 900) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export const FACET_NULL_VALUE = '__null__'

export type FacetRowModel = {
  value: string
  label: string
  /** `undefined` and `null` both mean "unknown", rendered as an em dash. */
  count: number | null | undefined
  selected: boolean
  /**
   * Could still match. Unknown counts are treated as available: we cannot
   * claim a row is dead on the strength of a number we never received.
   */
  available: boolean
}

export function resolveMode(group: FacetGroup): 'list' | 'lookup' {
  if (group.mode) return group.mode
  return group.hasMore !== undefined || group.loaded !== undefined || group.matchCount !== undefined
    ? 'lookup'
    : 'list'
}

export function isSearchable(group: FacetGroup, mode: 'list' | 'lookup'): boolean {
  if (group.searchable !== undefined) return group.searchable
  if (mode === 'lookup') return true
  return (group.cardinality ?? group.values.length) >= FACET_SEARCH_THRESHOLD
}

/**
 * A group label as one of its values, lower-cased: "Accounts" → "account",
 * "Categories" → "category", "Statuses" and "Status" → "status". Used for the
 * default "No account" row and the note under a fully ticked group.
 *
 * A handful of English rules, not a dictionary. Dropping every trailing "s"
 * is what gave "No statu" and "No categorie"; this covers the endings facet
 * labels actually have, and a host whose label still reads wrong ("Series",
 * "Alias") passes `nullLabel`.
 */
export function singularOf(label: string): string {
  const word = label.trim().toLowerCase()
  // Already singular: status, class, analysis.
  if (/(ss|us|is)$/.test(word)) return word
  if (/[^aeiou]ies$/.test(word)) return word.replace(/ies$/, 'y')
  // addresses, branches, boxes — and statuses, where "us" follows a consonant
  // (which is what keeps "causes" and "houses" out of this rule).
  if (/(ss|sh|ch|x|z|[^aeiou]us)es$/.test(word)) return word.slice(0, -2)
  return word.replace(/s$/, '')
}

export function nullRowValue(group: FacetGroup): string {
  return group.nullValue ?? FACET_NULL_VALUE
}

/**
 * The group's values as rows, with the "no value" row appended last when the
 * field is nullable. That row is what stops "all ticked" from quietly meaning
 * something different from "group cleared".
 */
export function toRows(group: FacetGroup, selected: string[]): FacetRowModel[] {
  const pick = new Set(selected)
  const rows = group.values.map((v) => rowOf(v, pick))
  if (group.nullable) {
    const value = nullRowValue(group)
    if (!group.values.some((v) => v.value === value)) {
      rows.push({
        value,
        label: group.nullLabel ?? `No ${singularOf(group.label)}`,
        count: undefined,
        selected: pick.has(value),
        available: true,
      })
    }
  }
  return rows
}

function rowOf(v: FacetValue, pick: Set<string>): FacetRowModel {
  const known = typeof v.count === 'number'
  return {
    value: v.value,
    label: v.label ?? v.value,
    count: v.count,
    selected: pick.has(v.value),
    available: !known || (v.count as number) > 0 || pick.has(v.value),
  }
}

/** Preserve host order: selecting a value or refreshing counts must not move targets. */
export function orderRows(rows: FacetRowModel[]): FacetRowModel[] {
  return rows
}

/** A selected row always survives its own group's filter. */
export function filterRows(rows: FacetRowModel[], query: string): FacetRowModel[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (r) => r.selected || r.label.toLowerCase().includes(q) || r.value.toLowerCase().includes(q),
  )
}

/**
 * Select-all takes what is *available and visible* — never the greyed-out
 * zeros, and with a search active only the matches. Selecting a row the count
 * already said cannot match is a promise the UI has no way to keep.
 */
export function selectableOf(rows: FacetRowModel[]): FacetRowModel[] {
  return rows.filter((r) => r.available)
}

export function triState(rows: FacetRowModel[]): 'none' | 'some' | 'all' {
  const target = selectableOf(rows)
  if (target.length === 0) return 'none'
  const on = target.filter((r) => r.selected).length
  if (on === 0) return 'none'
  return on === target.length ? 'all' : 'some'
}

export function countLabel(count: number | null | undefined, refreshing: boolean): string | null {
  if (refreshing) return null
  if (typeof count !== 'number') return '—'
  return count.toLocaleString()
}
