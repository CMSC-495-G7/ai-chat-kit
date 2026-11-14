// A host for the DataGrid stories: it owns every piece of state the grid asks
// for (filters, terms, sort, page, selection) and filters the fixture in memory,
// the way a real page would hand the same values to an API.
import { useMemo, useState, type ReactNode } from 'react'
import { STATUS_LABEL, type Tenant } from '../../fixtures/tenants'
import { Button } from '../../primitives/button'
import type { DateRange } from '../../primitives/date-field'
import { PlusIcon } from '../../primitives/icons'
import { sortRows } from '../data-table'
import type { FilterField } from '../filter-panel'
import type { Sort } from '../paging'
import { DataGrid } from './data-grid'
import { COLUMNS, EXPORT_COLUMNS, ROWS, TERM_FIELDS } from './data-grid.fixtures'
import { downloadRows } from './export'
import { findMatches, termMatches } from './filterModel'
import type { DataGridProps, ExportFormat, FilterTerm } from './types'

type Status = Tenant['status']
type FieldKey = 'name' | 'contact' | 'email'

const NONE: DateRange = { from: null, to: null }

export type TenantsGridProps = {
  /** Rows to start from. Pass `[]` for a list with nothing in it yet. */
  rows?: Tenant[]
  /** The filter panel and quick picks. Off, search and sorting are all there is. */
  filters?: boolean
  maxSelections?: number
  selectable?: boolean
  exportFormats?: ExportFormat[]
  defaultOpen?: boolean
  defaultPinned?: boolean
  loading?: boolean
  error?: DataGridProps<Tenant>['error']
  onRetry?: () => void
  emptyAction?: ReactNode
  bulkActions?: ReactNode
  pageSize?: number
  /** Called with the selected ids, for a story that shows them. */
  onSelected?: (ids: string[]) => void
  initialStatuses?: Status[]
  initialTerms?: FilterTerm[]
}

/** The tenants list, wired end to end. */
export function TenantsGrid({
  rows: source = ROWS,
  filters = true,
  maxSelections,
  selectable = true,
  exportFormats = ['csv', 'json'],
  defaultOpen = true,
  defaultPinned = true,
  loading = false,
  error,
  onRetry,
  emptyAction,
  bulkActions,
  pageSize = 8,
  onSelected,
  initialStatuses = [],
  initialTerms = [],
}: TenantsGridProps) {
  const [terms, setTerms] = useState<FilterTerm[]>(initialTerms)
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses)
  const [tiers, setTiers] = useState<string[]>([])
  const [created, setCreated] = useState<DateRange>(NONE)
  const [sort, setSort] = useState<Sort[]>([{ field: 'name', direction: 'asc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)
  const [selected, setSelected] = useState<string[]>([])

  const select = (ids: string[]) => {
    setSelected(ids)
    onSelected?.(ids)
  }

  const filtered = useMemo(
    () =>
      source.filter((t) => {
        if (statuses.length && !statuses.includes(t.status)) return false
        if (tiers.length && !tiers.includes(t.tier)) return false
        if (created.from && t.created < created.from) return false
        if (created.to && t.created > created.to) return false
        return terms.every((term) =>
          term.field
            ? termMatches(term, t[term.field as FieldKey])
            : [t.name, t.contact, t.email].some((v) => termMatches(term, v)),
        )
      }),
    [source, statuses, tiers, created, terms],
  )
  const sorted = useMemo(() => sortRows(filtered, sort, COLUMNS), [filtered, sort])
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  const countBy = (test: (t: Tenant) => boolean) => source.filter(test).length
  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: statuses,
      options: (['active', 'pending', 'suspended'] as Status[]).map((s) => ({
        value: s,
        label: STATUS_LABEL[s],
        count: countBy((t) => t.status === s),
      })),
      onChange: (v) => {
        setStatuses(v as Status[])
        setPage(1)
      },
    },
    {
      id: 'tier',
      label: 'Tier',
      type: 'options',
      value: tiers,
      options: ['Enterprise', 'Growth', 'Starter'].map((tier) => ({
        value: tier,
        label: tier,
        count: countBy((t) => t.tier === tier),
      })),
      onChange: (v) => {
        setTiers(v)
        setPage(1)
      },
    },
    {
      id: 'created',
      label: 'Created',
      type: 'dateRange',
      presets: true,
      value: created,
      onChange: (v) => {
        setCreated(v)
        setPage(1)
      },
    },
  ]

  return (
    <DataGrid
      searchLabel="Search and filter tenants"
      caption="Tenants"
      columns={COLUMNS}
      rows={pageRows}
      rowId={(t) => t.id}
      rowLabel={(t) => t.name}
      fields={filters ? fields : undefined}
      terms={terms}
      onTermsChange={(next) => {
        setTerms(next)
        setPage(1)
      }}
      termFields={TERM_FIELDS}
      findMatches={(q) => findMatches(q, source, TERM_FIELDS)}
      onReset={() => {
        setStatuses([])
        setTiers([])
        setCreated(NONE)
        setPage(1)
      }}
      defaultOpen={defaultOpen}
      defaultPinned={defaultPinned}
      sort={sort}
      onSortChange={(s) => {
        setSort(s)
        setPage(1)
      }}
      selectedIds={selectable ? selected : undefined}
      onSelectionChange={selectable ? select : undefined}
      maxSelections={maxSelections}
      bulkActions={bulkActions}
      loading={loading}
      skeletonRows={size}
      error={error}
      onRetry={onRetry}
      emptyAction={emptyAction}
      labels={{
        noMatchTitle: 'No tenants match',
        emptyTitle: 'No tenants yet',
        emptyBody: 'Tenants you add show up here, with their contacts and seats.',
        errorTitle: 'Couldn’t load tenants',
      }}
      exportFormats={exportFormats}
      totalCount={sorted.length}
      onExport={(format, scope) =>
        downloadRows(
          'tenants',
          format,
          scope === 'selected' ? sorted.filter((t) => selected.includes(t.id)) : sorted,
          EXPORT_COLUMNS,
        )
      }
      pagination={{
        page: safePage,
        size,
        totalElements: sorted.length,
        onPageChange: setPage,
        onSizeChange: (n) => {
          setSize(n)
          setPage(1)
        },
        sizeOptions: [5, 8, 15],
      }}
    />
  )
}

/** The "Add tenant" button the empty story offers. */
export const AddTenant = () => (
  <Button variant="primary" size="sm" icon={<PlusIcon width={14} height={14} />}>
    Add tenant
  </Button>
)
