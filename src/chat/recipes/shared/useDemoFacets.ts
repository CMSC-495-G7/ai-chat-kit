import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { FacetGroup } from '../../../components/facet-filters'
import type { AskedOverChip, AskedOverScope } from '../../engine/types'
import {
  DATE_RANGES,
  describeScope,
  LOAN_COUNT,
  queryFacets,
  resolveScope,
  searchLoans,
} from '../../fixtures/facets'
import {
  activeFacetCount,
  DEMO_PAGE_SIZE,
  demoFacetActions,
  getSnapshot,
  subscribe,
} from './demoFacetStore'

/**
 * The host half of the Filters rail: what a real app's data layer would do.
 *
 * `FacetFilters` is controlled and fetches nothing, so everything that looks
 * like a network concern lives here — the recount on every change, the
 * debounced lookup search, the page ceiling. Swapping these two calls for
 * `fetch` is the whole migration.
 *
 * Both hosts use this. The side rail and the widget panel are the same
 * component with different density, reading the same store.
 */
export function useDemoFacets() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const [refreshing, setRefreshing] = useState(false)

  const dayCount = Number(state.days)

  // The mock answers synchronously, which would hide the state that matters
  // most on a real endpoint: counts blanking rather than going stale. Hold
  // the in-flight look for a beat so it is visible in the demo.
  useEffect(() => {
    setRefreshing(true)
    const id = setTimeout(() => setRefreshing(false), 320)
    return () => clearTimeout(id)
  }, [state.selection, state.queries, state.days])

  // POST /facets — every list group's counts, each computed with that group's
  // own selections excluded.
  const snapshot = useMemo(
    () => queryFacets(state.selection, dayCount, state.queries),
    [state.selection, dayCount, state.queries],
  )

  // POST /facets/loans/search — the high-cardinality group never rides along
  // with the recount above; 20k terms aggregated on every checkbox is what
  // takes a real endpoint down.
  const loanPage = useMemo(
    () => searchLoans(state.selection, dayCount, state.loanQuery, state.loanLimit, state.queries),
    [state.selection, dayCount, state.loanQuery, state.loanLimit, state.queries],
  )

  const groups: FacetGroup[] = useMemo(
    () => [
      ...snapshot.groups,
      {
        key: 'loans',
        label: 'Loan Number',
        mode: 'lookup',
        cardinality: LOAN_COUNT,
        values: loanPage.values,
        loaded: loanPage.loaded,
        matchCount: loanPage.matchCount,
        hasMore: loanPage.hasMore,
      },
    ],
    [snapshot.groups, loanPage],
  )

  // Stable identities: the group runs its search in an effect keyed on these.
  const onSearchGroup = useCallback((groupKey: string, query: string) => {
    if (groupKey === 'loans') demoFacetActions.setLoanQuery(query)
  }, [])

  const onLoadMore = useCallback((groupKey: string) => {
    if (groupKey === 'loans') demoFacetActions.loadMore()
  }, [])

  const onLoadAll = useCallback((groupKey: string) => {
    if (groupKey === 'loans') demoFacetActions.loadAll()
  }, [])

  const scope = useMemo(
    () => ({
      label: 'Range',
      value: state.days,
      options: DATE_RANGES,
      onChange: demoFacetActions.setDays,
    }),
    [state.days],
  )

  return {
    selection: state.selection,
    queries: state.queries,
    customFacets: state.customFacets,
    setSelection: demoFacetActions.setSelection,
    addQuery: demoFacetActions.addQuery,
    removeQuery: demoFacetActions.removeQuery,
    addCustomFacet: demoFacetActions.addCustomFacet,
    removeCustomFacet: demoFacetActions.removeCustomFacet,
    clearAll: demoFacetActions.clearAll,
    groups,
    total: snapshot.total,
    refreshing,
    scope,
    onSearchGroup,
    onLoadMore,
    onLoadAll,
    pageSize: DEMO_PAGE_SIZE,
  }
}

/**
 * Just the badge number. The widget's rail icon needs this and nothing else,
 * and recounting 20,000 loans to draw a bubble would be absurd.
 */
export function useDemoFacetCount(): number {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return activeFacetCount(state)
}

/**
 * What the next turn is being asked over.
 *
 * Plain function, not a hook: `useChat` calls it at dispatch, outside render.
 * Returns undefined when nothing is filtered, and the transcript then shows
 * nothing at all rather than a "no filters" line on every message.
 */
function captureDemoScope(): AskedOverScope | undefined {
  const state = getSnapshot()
  const chips = describeScope(state.selection, state.days, state.queries, state.customFacets)
  if (chips.length === 0) return undefined
  const { total } = queryFacets(state.selection, Number(state.days), state.queries)
  return { total, chips, capturedAt: new Date().toISOString() }
}

/** The chips in force now, for comparing against what a question recorded. */
function useDemoScopeChips(): AskedOverChip[] {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(
    () => describeScope(state.selection, state.days, state.queries, state.customFacets),
    [state],
  )
}

/**
 * Put a recorded scope back on the rail.
 *
 * Whatever no longer resolves is reported rather than skipped: restoring
 * three quarters of a scope and calling it done is how someone ends up
 * reading an answer to a question they did not ask.
 */
function restoreDemoScope(scope: AskedOverScope): { missing: string[] } {
  const { selection, queries, customFacets, days, missing } = resolveScope(scope.chips)
  demoFacetActions.clearAll()
  if (days) demoFacetActions.setDays(days)
  demoFacetActions.setSelection(selection)
  queries.forEach(demoFacetActions.addQuery)
  customFacets.forEach(demoFacetActions.addCustomFacet)
  return { missing }
}

/** Both halves, for a host that reads them inside a React tree. */
export function useDemoScope() {
  const chips = useDemoScopeChips()
  return useMemo(() => ({ capture: captureDemoScope, chips, onRestore: restoreDemoScope }), [chips])
}
