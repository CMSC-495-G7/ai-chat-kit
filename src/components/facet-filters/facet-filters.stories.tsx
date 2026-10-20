import type { Meta, StoryObj } from '@storybook/react-vite'
import { useCallback, useMemo, useState } from 'react'
import { fn } from 'storybook/test'
import {
  DATE_RANGES,
  FACET_TYPES,
  LOAN_COUNT,
  describeFacetType,
  queryFacets,
  searchLoans,
} from '../../fixtures/facets'
import { FacetFilters } from './facet-filters'
import type { CustomFacet, FacetFiltersProps, FacetQuery, FacetSelection } from './types'

const PAGE = 50

/**
 * The host every story renders: it owns the selection, the scope, the query
 * chips and the custom facets, and answers the component's callbacks against
 * the fixture index — exactly what a real host does against `/facets`.
 */
function Host(props: Partial<FacetFiltersProps>) {
  const [selection, setSelection] = useState<FacetSelection>({ accounts: ['ops', 'pay'] })
  const [days, setDays] = useState('90')
  const [queries, setQueries] = useState<FacetQuery[]>([])
  const [custom, setCustom] = useState<CustomFacet[]>([])
  const [loanQuery, setLoanQuery] = useState('')
  const [loanLimit, setLoanLimit] = useState(PAGE)

  const facets = useMemo(
    () => queryFacets(selection, Number(days), queries),
    [selection, days, queries],
  )
  const lookup = useMemo(
    () => searchLoans(selection, Number(days), loanQuery, loanLimit, queries),
    [selection, days, loanQuery, loanLimit, queries],
  )

  const searchGroup = useCallback((key: string, query: string) => {
    if (key !== 'loans') return
    setLoanQuery(query)
    setLoanLimit(PAGE)
  }, [])

  return (
    <FacetFilters
      groups={[
        ...facets.groups,
        {
          key: 'loans',
          label: 'Loan Number',
          cardinality: LOAN_COUNT,
          values: lookup.values,
          loaded: lookup.loaded,
          matchCount: lookup.matchCount,
          hasMore: lookup.hasMore,
        },
      ]}
      selection={selection}
      onSelectionChange={setSelection}
      total={facets.total}
      scope={{
        label: 'Date range',
        value: days,
        options: DATE_RANGES,
        onChange: setDays,
      }}
      facetTypes={FACET_TYPES}
      describeFacetType={describeFacetType}
      customFacets={custom}
      onAddCustomFacet={(f) => setCustom((c) => [...c, { ...f, id: `${f.type}-${c.length}` }])}
      onRemoveCustomFacet={(id) => setCustom((c) => c.filter((f) => f.id !== id))}
      queries={queries}
      onAddQuery={(q) => setQueries((list) => [...list, q])}
      onRemoveQuery={(q) =>
        setQueries((list) => list.filter((x) => x.groupKey !== q.groupKey || x.query !== q.query))
      }
      onSearchGroup={searchGroup}
      onLoadMore={() => setLoanLimit((n) => n + PAGE)}
      onLoadAll={() => setLoanLimit(LOAN_COUNT)}
      pageSize={PAGE}
      onClearAll={() => {
        setSelection({})
        setQueries([])
        setCustom([])
      }}
      defaultOpen
      {...props}
    />
  )
}

const meta = {
  title: 'Components/FacetFilters',
  component: FacetFilters,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[19rem] rounded-surface border border-line bg-panel-solid">{Story()}</div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'The Filters section of a side rail. Controlled end to end — it fetches nothing, counts nothing and stores nothing, so a live `/facets` endpoint and this story’s fixture satisfy the same props. Fully loaded groups search locally at any size; paged groups ask the host for matches. Large lists use TanStack Virtual. Bulk selection and expanded chip previews are bounded.',
      },
    },
  },
} satisfies Meta<typeof FacetFilters>

export default meta
type Story = StoryObj<typeof FacetFilters>

export const Comfortable: Story = { render: () => <Host /> }

/** The widget's panel: fewer groups open, shorter previews, a Done bar. */
export const Compact: Story = {
  render: () => <Host density="compact" showHeader={false} onDone={fn()} />,
}

/** Counts blank to a bar while a refetch is in flight; rows stay clickable. */
export const Refreshing: Story = { render: () => <Host refreshing /> }

/** The facet call failed: counts become em dashes and Retry appears. */
export const FetchError: Story = {
  render: () => <Host error="The facet service did not respond." onRetry={fn()} />,
}

/** The sidebar is a slim icon rail — only the entry point renders. */
export const RailCollapsed: Story = {
  decorators: [(Story) => <div className="w-12">{Story()}</div>],
  render: () => <Host railCollapsed onExpandRail={fn()} />,
}

/** Deterministic large payloads, not a server simulation: all values are in memory. */
function LargeHost({
  size,
  density = 'comfortable',
  picked = 0,
}: {
  size: number
  density?: 'comfortable' | 'compact'
  picked?: number
}) {
  const options = useMemo(
    () =>
      Array.from({ length: size }, (_, i) => ({
        value: `a${i + 1}`,
        label: `Account ${String(i + 1).padStart(5, '0')}`,
        count: 1000,
      })),
    [size],
  )
  const [selection, setSelection] = useState<FacetSelection>(() => ({
    accounts: options.slice(0, picked).map((option) => option.value),
  }))
  const [queries, setQueries] = useState<FacetQuery[]>([])
  const [revision, setRevision] = useState(0)
  const groups = useMemo(
    () => [
      {
        key: 'accounts',
        label: 'Accounts',
        cardinality: size,
        // Reverse host order and vary counts to exercise stable refresh handling.
        values: revision
          ? options.map((option, i) => ({ ...option, count: i % 7 ? 42 : 0 })).reverse()
          : options,
      },
    ],
    [options, revision, size],
  )
  return (
    <>
      <button
        type="button"
        onClick={() => setRevision((n) => n + 1)}
        className="m-2 text-xs text-brand-fg"
      >
        Refresh counts
      </button>
      <FacetFilters
        groups={groups}
        selection={selection}
        onSelectionChange={setSelection}
        density={density}
        showHeader={density !== 'compact'}
        onDone={density === 'compact' ? () => {} : undefined}
        className={density === 'compact' ? 'min-h-0 flex-1' : undefined}
        total={size * 1000}
        queries={queries}
        onAddQuery={(query) => setQueries((list) => [...list, query])}
        onRemoveQuery={(query) => setQueries((list) => list.filter((entry) => entry !== query))}
        onClearAll={() => {
          setSelection({})
          setQueries([])
        }}
      />
    </>
  )
}

export const Local3000: Story = { render: () => <LargeHost size={3000} /> }
export const Local10000: Story = { render: () => <LargeHost size={10000} /> }
export const Compact10000: Story = {
  decorators: [
    (Story) => (
      <div className="flex h-[530px] flex-col">
        <Story />
      </div>
    ),
  ],
  render: () => <LargeHost size={10000} density="compact" />,
}
export const ThousandSelected: Story = { render: () => <LargeHost size={6000} picked={1000} /> }

function SixAccountsHost() {
  const [selection, setSelection] = useState<FacetSelection>({})
  return (
    <FacetFilters
      groups={[
        {
          key: 'accounts',
          label: 'Accounts',
          values: Array.from({ length: 6 }, (_, i) => ({
            value: `account${i}`,
            label: `Account ${i + 1}`,
            count: 1000,
          })),
        },
      ]}
      selection={selection}
      onSelectionChange={setSelection}
      total={selection.accounts?.length ? selection.accounts.length * 1000 : 6000}
    />
  )
}

export const SixAccounts: Story = { render: () => <SixAccountsHost /> }

/** A host can remove helper controls without forking the filtering UI. */
export const MinimalControls: Story = {
  render: () => (
    <Host
      showHeader={false}
      showSearch={false}
      showTotal={false}
      showCounts={false}
      showActiveFilters={false}
      showUnavailableToggle={false}
      defaultShowUnavailable={false}
      showSelectionHints={false}
      showSelectAll={false}
      showLoadAll={false}
      showLoadHint={false}
      facetTypes={[]}
      scope={undefined}
    />
  ),
}

export const ConsumerConfigured: Story = {
  render: () => (
    <Host
      layout={{ listPreview: 4, windowRows: 5, groupsOpen: 3, maxChips: 6 }}
      chipOptions={{ collapseAt: 2, previewLimit: 5, expandedLimit: 12, height: 96 }}
      showUnavailableToggle={false}
      labels={{
        title: 'Refine results',
        hideUnavailable: 'Hide empty options',
        done: 'Close filters',
        findPlaceholder: 'Search filter values',
        itemsInScope: (n) => `${n.toLocaleString()} matching records`,
      }}
    />
  ),
}
