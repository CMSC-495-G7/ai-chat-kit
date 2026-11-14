import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '../../primitives/button'
import { SegmentedControl } from '../../primitives/segmented-control'
import { DataGrid } from './data-grid'
import { AddTenant, TenantsGrid } from './data-grid.example'
import { ROWS } from './data-grid.fixtures'

const DOCS = `
A list page in one component: a table with its search, filters, selection,
export and pagination. Every story is live.

**What it is built from**

| Part | Component | What it does here |
| --- | --- | --- |
| Rows | **DataTable** (\`DataTableView\`) | Columns, sorting, selection (\`maxSelections\`), expandable rows, row actions, and the loading, empty and error states at a 22rem floor. Every \`DataTable\` prop works on \`DataGrid\`. |
| Search box | **Omnibox** + quick picks | Click it while empty for quick picks. Type for values from the data first ("bay" → Bayshore Financial in Name), then matching filters, then search or narrow. Each pick is a chip. |
| Filters | **FilterPanel** (\`layout="fill"\`) | Draws \`fields\`. Floats under the toolbar, or, pinned, docks as the grid's first column at the table's exact height. |
| Pages | **Pagination** | The \`pagination\` prop: pages, rows per page, and the range on show. Dims while loading, hidden with no rows. |
| Selection | **BulkBar** | The count ("2 of 3 selected", "Crestview Bank selected") and the host's \`bulkActions\`. |
| Export | **Button**, **Popover**, **Menu**, **RadioGroup** | A plain "Export CSV" button for one format; a menu for two, which asks for selected or all rows when some are selected. |
| No match | **StateMessage**, **FilterChip** | With filters on and nothing left: the filters as chips to remove, and Clear all. |

The grid holds no data. Rows, filters, terms, sort, page and selection are the
host's. \`findMatches\`, \`termMatches\` and \`downloadRows\` cover the usual
in-memory host; a paged API does the same with query parameters.
`

const meta = {
  title: 'Components/DataGrid',
  component: DataGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: DOCS } },
  },
} satisfies Meta<typeof DataGrid>

export default meta
type Story = StoryObj<typeof meta>

// The stories render their own host, which owns the state; the grid's props are its.
const render = (node: React.ReactNode) => ({ render: () => <>{node}</> }) as unknown as Story

/**
 * The everyday list: search, sorting, pagination and a CSV export. No panel and
 * no selection. Type a name and press Enter.
 */
export const SimpleList: Story = render(
  <TenantsGrid filters={false} selectable={false} exportFormats={['csv']} />,
)

/**
 * Everything on: the docked panel, quick picks and typed matches, selection
 * with bulk actions, export to CSV or JSON, and pagination.
 */
export const Everything: Story = render(
  <TenantsGrid
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
  />,
)

function PickOneHost() {
  const [picked, setPicked] = useState<string[]>([])
  const name = ROWS.find((t) => t.id === picked[0])?.name
  return (
    <div className="flex flex-col gap-3">
      <TenantsGrid
        maxSelections={1}
        exportFormats={['csv']}
        defaultOpen={false}
        onSelected={setPicked}
        bulkActions={
          <Button variant="inverse" size="sm">
            Open
          </Button>
        }
      />
      <p className="text-[13px] text-ink-soft" data-testid="picked">
        Picked: <b className="text-ink-strong">{name ?? 'nothing yet'}</b>
      </p>
    </div>
  )
}

/**
 * Choosing one record, as a picker does: `maxSelections={1}` draws radio
 * buttons, and a new pick (or a click on the row) replaces the last. A higher
 * limit keeps the latest picks instead, for "compare up to three".
 */
export const PickOne: Story = render(<PickOneHost />)

const STATES = [
  { value: 'rows', label: 'Rows' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Nothing yet' },
  { value: 'nomatch', label: 'No match' },
  { value: 'error', label: 'Error' },
] as const

function StatesHost() {
  const [state, setState] = useState<(typeof STATES)[number]['value']>('empty')
  const [retries, setRetries] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="State"
        value={state}
        options={[...STATES]}
        onValueChange={(v) => setState(v as typeof state)}
        className="self-start"
      />
      <TenantsGrid
        // A fresh host for each state, so "No match" starts from its filter.
        key={state}
        rows={state === 'empty' ? [] : undefined}
        loading={state === 'loading'}
        error={state === 'error'}
        onRetry={() => setRetries((n) => n + 1)}
        emptyAction={<AddTenant />}
        initialTerms={
          state === 'nomatch' ? [{ id: 'none', field: null, value: 'zebra' }] : undefined
        }
        initialStatuses={state === 'nomatch' ? ['active'] : undefined}
      />
      {retries > 0 && <p className="text-[12.5px] text-ink-soft">Try again pressed {retries}×</p>}
    </div>
  )
}

/**
 * Loading, nothing yet, no match and an error, in one frame at one height
 * (`minBodyHeight`, 22rem), so the page never jumps between them.
 */
export const States: Story = render(<StatesHost />)
