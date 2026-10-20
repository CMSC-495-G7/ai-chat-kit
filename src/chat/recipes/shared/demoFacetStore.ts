// The demo's filter state, in a module store rather than a component's
// useState.
//
// Two surfaces need the same answer at the same time: the widget's Filters
// panel and the badge on its icon rail, which live in the same React tree but
// share no ancestor the demo owns (the widget is mounted imperatively). A
// store subscribed to with useSyncExternalStore is the smallest thing that
// serves both, and it keeps the full-page rail on exactly the same code path.
//
// A real app would not need this: it already has a store, and `FacetFilters`
// is controlled precisely so it can be driven from one.
import type { CustomFacet, FacetQuery, FacetSelection } from '../../../components/facet-filters'

export type DemoFacetState = {
  selection: FacetSelection
  queries: FacetQuery[]
  customFacets: CustomFacet[]
  /** Scope. Days back; the whole control is optional on the component. */
  days: string
  /** The lookup group's current query and page ceiling. */
  loanQuery: string
  loanLimit: number
}

const STORAGE_KEY = 'demo-facet-filters'
/** What one "Load more" fetches. Handed to the component so its button agrees. */
export const DEMO_PAGE_SIZE = 500
const PAGE = DEMO_PAGE_SIZE

const EMPTY: DemoFacetState = {
  selection: {},
  queries: [],
  customFacets: [],
  days: '30',
  loanQuery: '',
  loanLimit: PAGE,
}

function hydrate(): DemoFacetState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const stored = JSON.parse(raw) as Partial<DemoFacetState>
    // Paging is per-session: a reload should not silently re-fetch 20k rows.
    return { ...EMPTY, ...stored, loanQuery: '', loanLimit: PAGE }
  } catch {
    return EMPTY
  }
}

let state: DemoFacetState = hydrate()
const listeners = new Set<() => void>()

function commit(next: DemoFacetState) {
  state = next
  try {
    const { selection, queries, customFacets, days } = next
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selection, queries, customFacets, days }),
    )
  } catch {
    /* private mode or quota — the in-memory state still works */
  }
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): DemoFacetState {
  return state
}

export const demoFacetActions = {
  setSelection(selection: FacetSelection) {
    commit({ ...state, selection })
  },

  addQuery(query: FacetQuery) {
    const exists = state.queries.some(
      (q) => q.groupKey === query.groupKey && q.query === query.query,
    )
    if (exists) return
    commit({ ...state, queries: [...state.queries, query] })
  },

  removeQuery(query: FacetQuery) {
    commit({
      ...state,
      queries: state.queries.filter(
        (q) => !(q.groupKey === query.groupKey && q.query === query.query),
      ),
    })
  },

  addCustomFacet(facet: { type: string; value: string }) {
    const exists = state.customFacets.some(
      (f) => f.type === facet.type && f.value.toLowerCase() === facet.value.toLowerCase(),
    )
    if (exists) return
    commit({
      ...state,
      customFacets: [
        ...state.customFacets,
        { id: `${facet.type}:${facet.value}:${Date.now()}`, ...facet },
      ],
    })
  },

  removeCustomFacet(id: string) {
    commit({ ...state, customFacets: state.customFacets.filter((f) => f.id !== id) })
  },

  clearAll() {
    commit({ ...state, selection: {}, queries: [], customFacets: [] })
  },

  setDays(days: string) {
    commit({ ...state, days })
  },

  /** A new query is a new list: the page ceiling goes back to one page. */
  setLoanQuery(loanQuery: string) {
    if (loanQuery === state.loanQuery) return
    commit({ ...state, loanQuery, loanLimit: PAGE })
  },

  loadMore() {
    commit({ ...state, loanLimit: state.loanLimit + PAGE })
  },

  /** Everything left, in one call. The control that offers this names the number. */
  loadAll() {
    commit({ ...state, loanLimit: Number.MAX_SAFE_INTEGER })
  },
}

export function activeFacetCount(snapshot: DemoFacetState = state): number {
  return (
    Object.values(snapshot.selection).reduce((sum, values) => sum + values.length, 0) +
    snapshot.queries.length +
    snapshot.customFacets.length
  )
}
