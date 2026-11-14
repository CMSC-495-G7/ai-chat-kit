import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { STATUS_LABEL, STATUS_TONE, TENANTS, fmtDate, type Tenant } from '../../fixtures/tenants'
import { Avatar } from '../../primitives/avatar'
import { Button } from '../../primitives/button'
import { IconButton } from '../../primitives/icon-button'
import { DotsIcon, PencilIcon, TrashIcon } from '../../primitives/icons'
import { Pill } from '../../primitives/pill'
import type { Sort } from '../paging'
import { DataTable } from './data-table'
import { sortRows as sortByType, toSortParam } from './sorting'
import type { Column } from './types'

const COLUMNS: Column<Tenant>[] = [
  {
    id: 'name',
    header: 'Name',
    sortKey: 'name',
    width: '23%',
    cell: (t) => (
      <span className="flex items-center gap-2.5">
        <Avatar variant="text" text={t.initials} size={28} tone="soft" aria-hidden />
        <span data-row-title className="truncate font-bold text-ink-strong">
          {t.name}
        </span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortKey: 'status',
    width: '12%',
    cell: (t) => (
      <Pill tone={STATUS_TONE[t.status]} variant="outline" size="sm">
        {STATUS_LABEL[t.status]}
      </Pill>
    ),
  },
  {
    id: 'contact',
    header: 'Primary contact',
    sortKey: 'contact',
    width: '17%',
    hideBelow: 'lg',
    cell: (t) => <span className="truncate">{t.contact}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    sortKey: 'email',
    width: '20%',
    hideBelow: 'xl',
    cell: (t) => <span className="block truncate text-ink-soft">{t.email}</span>,
  },
  {
    id: 'seats',
    header: 'Seats',
    align: 'end',
    width: '9%',
    hideBelow: 'md',
    cell: (t) => (
      <span className="whitespace-nowrap tabular-nums">
        {t.seats[0]} / {t.seats[1]}
      </span>
    ),
  },
  {
    id: 'created',
    header: 'Created',
    sortKey: 'created',
    width: '13%',
    hideBelow: 'md',
    cell: (t) => <span className="whitespace-nowrap text-ink-soft">{fmtDate(t.created)}</span>,
  },
]

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-extrabold tracking-[0.06em] text-ink-soft uppercase">
        {label}
      </span>
      <span className="text-[13.5px] text-ink">{children}</span>
    </div>
  )
}

const meta = {
  title: 'Components/DataTable',
  component: DataTable<Tenant>,
  tags: ['autodocs'],
  args: {
    caption: 'Tenants',
    columns: COLUMNS,
    rows: TENANTS.slice(0, 6),
    rowId: (t: Tenant) => t.id,
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    toolbar: { control: false },
    footer: { control: false },
    empty: { control: false },
    bulkActions: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The table on its own: rows, sorting, selection, expandable rows, pagination, and the loading and empty states. For a list page with search, filters and export, use **DataGrid**, which is built on it. The table fetches nothing and remembers nothing. Sort, selection, expansion and paging are all props, so a client-side fixture and a paged API drive it identically. `table-fixed` columns honour their `width`; `hideBelow` sheds low-priority columns before the rest get squeezed; `minWidth` makes it scroll rather than overlap.',
      },
    },
  },
} satisfies Meta<typeof DataTable<Tenant>>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** Tick a row and the bulk bar replaces the header. */
export const Selection: Story = {
  render: function SelectionStory(args) {
    const [selected, setSelected] = useState<string[]>([TENANTS[1].id, TENANTS[3].id])
    return (
      <DataTable
        {...args}
        selectedIds={selected}
        onSelectionChange={setSelected}
        bulkActions={
          <>
            <Button variant="inverse" size="sm">
              Change status
            </Button>
            <Button variant="inverse" size="sm">
              Assign owner
            </Button>
          </>
        }
      />
    )
  },
}

/**
 * Supplying `renderExpanded` makes rows clickable; row actions never toggle.
 * There is no caret: the open row has a rail and a filled avatar, and a closed
 * one underlines its name on hover. Actions show on hover, focus, and open rows.
 */
export const ExpandableRows: Story = {
  render: function ExpandStory(args) {
    const [expanded, setExpanded] = useState<string[]>([TENANTS[0].id])
    return (
      <DataTable
        {...args}
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        renderExpanded={(t) => (
          <div className="grid grid-cols-4 gap-x-6 gap-y-4 max-md:grid-cols-2">
            <Detail label="Tenant ID">
              <span className="font-bold tabular-nums">{t.id}</span>
            </Detail>
            <Detail label="Plan tier">{t.tier}</Detail>
            <Detail label="Region">{t.region}</Detail>
            <Detail label="Renewal">{fmtDate(t.renewal)}</Detail>
          </div>
        )}
        rowActions={(t) => (
          <>
            <IconButton size="sm" shape="rounded" aria-label={`Edit ${t.name}`} title="Edit">
              <PencilIcon width={14} height={14} />
            </IconButton>
            <IconButton size="sm" shape="rounded" aria-label={`Delete ${t.name}`} title="Delete">
              <TrashIcon width={14} height={14} />
            </IconButton>
            <IconButton
              size="sm"
              shape="rounded"
              aria-label={`More actions for ${t.name}`}
              title="More"
            >
              <DotsIcon width={14} height={14} />
            </IconButton>
          </>
        )}
      />
    )
  },
}

/** Skeleton rows keep the header and frame; match `skeletonRows` to the page size. */
export const Loading: Story = { args: { loading: true, skeletonRows: 6 } }

/** Nothing yet: it says so at full height, and offers the next step with `emptyAction`. */
export const Empty: Story = {
  args: {
    rows: [],
    labels: {
      emptyTitle: 'No tenants yet',
      emptyBody: 'Tenants you add show up here, with their contacts and seats.',
    },
    emptyAction: (
      <Button variant="primary" size="sm">
        Add tenant
      </Button>
    ),
  },
}

/** Paged client-side with `pagination`: pages, rows per page, and the range it shows. */
export const Paged: Story = {
  render: function PagedStory(args) {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(5)
    return (
      <DataTable
        {...args}
        rows={TENANTS.slice((page - 1) * size, page * size)}
        pagination={{
          page,
          size,
          totalElements: TENANTS.length,
          onPageChange: setPage,
          onSizeChange: (n) => {
            setSize(n)
            setPage(1)
          },
          sizeOptions: [5, 10, 25],
        }}
      />
    )
  },
}

/**
 * Rows to sort by type. One has no created date, to show that a row with nothing to compare goes
 * last whichever way the column sorts, and one starts with a lowercase letter, to show that text
 * ignores case.
 */
const SORT_ROWS: Tenant[] = [
  ...TENANTS.slice(0, 7),
  { ...TENANTS[0], id: 'tnt_gap', name: 'apex Credit Union', initials: 'AC', created: '' },
]

/**
 * Typed columns. Seats compares as numbers, Created as dates, Name as text. Email has a `sortKey`
 * but `sortable: false`, the way a field the backend cannot order by looks. Status has no key.
 */
const SORT_COLUMNS: Column<Tenant>[] = [
  {
    id: 'name',
    header: 'Name',
    sortKey: 'name',
    width: '26%',
    cell: (t) => (
      <span className="flex items-center gap-2.5">
        <Avatar variant="text" text={t.initials} size={28} tone="soft" aria-hidden />
        <span data-row-title className="truncate font-bold text-ink-strong">
          {t.name}
        </span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: '14%',
    cell: (t) => (
      <Pill tone={STATUS_TONE[t.status]} variant="outline" size="sm">
        {STATUS_LABEL[t.status]}
      </Pill>
    ),
  },
  {
    id: 'email',
    header: 'Email',
    sortKey: 'email',
    sortable: false,
    width: '24%',
    cell: (t) => <span className="block truncate text-ink-soft">{t.email}</span>,
  },
  {
    id: 'seats',
    header: 'Seats in use',
    sortKey: 'seats',
    sortType: 'number',
    sortValue: (t) => t.seats[0],
    align: 'end',
    width: '16%',
    cell: (t) => (
      <span className="whitespace-nowrap tabular-nums">
        {t.seats[0]} / {t.seats[1]}
      </span>
    ),
  },
  {
    id: 'created',
    header: 'Created',
    sortKey: 'created',
    sortType: 'date',
    width: '20%',
    cell: (t) => (
      <span className="whitespace-nowrap text-ink-soft">
        {t.created ? fmtDate(t.created) : '–'}
      </span>
    ),
  },
]

function SortingHost() {
  const [sort, setSort] = useState<Sort[]>([])
  const rows = useMemo(() => sortByType(SORT_ROWS, sort, SORT_COLUMNS), [sort])
  // What a paged table would send. Columns that cannot sort never reach it.
  const param = toSortParam(sort, SORT_COLUMNS)
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        caption="Tenants"
        columns={SORT_COLUMNS}
        rows={rows}
        rowId={(t) => t.id}
        sort={sort}
        onSortChange={setSort}
      />
      <p className="text-[12.5px] text-ink-soft">
        Request:{' '}
        <output aria-label="Sort request" className="rounded bg-code px-1 py-0.5 text-[11.5px]">
          {param ? `?sort=${param}` : '(no sort parameter)'}
        </output>
      </p>
    </div>
  )
}

/**
 * Sorting by type. Seats sorts as numbers (88 before 412, not after), Created as dates, Name as
 * text without regard to case. A row with nothing to compare goes last either way. The line below
 * is what a paged table would send: `toSortParam` writes it from the same columns, and Email, which
 * has a `sortKey` but `sortable: false`, can never appear in it.
 */
export const Sorting: Story = {
  render: () => <SortingHost />,
}
