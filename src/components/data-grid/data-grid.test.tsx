import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Column } from '../data-table'
import { DataGrid } from './data-grid'
import { termMatches } from './filterModel'
import type { DataGridProps, FilterTerm } from './types'

type Row = { id: string; name: string; contact: string }

const ROWS: Row[] = [
  { id: 'a', name: 'Bayshore Financial', contact: 'Marcus Webb' },
  { id: 'b', name: 'Crestview Bank', contact: 'Sarah Johnson' },
  { id: 'c', name: 'Prosperity Bank', contact: 'Michael Smith' },
]
const COLUMNS: Column<Row>[] = [
  { id: 'name', header: 'Name', cell: (r) => r.name },
  { id: 'contact', header: 'Contact', cell: (r) => r.contact },
]
const TERM_FIELDS = [{ key: 'name', label: 'Name', glyph: 'Aa', param: 'name__icontains' }]

/** A host that filters in memory, the way the stories do. */
function Host(props: Partial<DataGridProps<Row>> & { rows?: Row[] }) {
  const [terms, setTerms] = useState<FilterTerm[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const source = props.rows ?? ROWS
  const rows = source.filter((r) => terms.every((t) => termMatches(t, r.name)))
  return (
    <DataGrid
      searchLabel="Search tenants"
      caption="Tenants"
      columns={COLUMNS}
      rowId={(r) => r.id}
      rowLabel={(r) => r.name}
      terms={terms}
      onTermsChange={setTerms}
      termFields={TERM_FIELDS}
      selectedIds={selected}
      onSelectionChange={setSelected}
      {...props}
      rows={rows}
    />
  )
}

describe('DataGrid', () => {
  it('typing offers a value from the data first, and Enter makes it an exact chip', async () => {
    const user = userEvent.setup()
    render(<Host />)
    const box = screen.getByRole('combobox', { name: 'Search tenants' })
    await user.type(box, 'bay')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('Bayshore Financial')
    expect(options[0]).toHaveTextContent('in Name')
    await user.keyboard('{Enter}')
    expect(screen.getByTitle('name is Bayshore Financial')).toBeInTheDocument()
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2)
  })

  it('maxSelections={1} draws radios, and a new pick replaces the old', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataGrid
        searchLabel="Search"
        caption="Tenants"
        columns={COLUMNS}
        rows={ROWS}
        rowId={(r) => r.id}
        rowLabel={(r) => r.name}
        selectedIds={['a']}
        onSelectionChange={onSelectionChange}
        maxSelections={1}
      />,
    )
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByText('Bayshore Financial selected')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Select Crestview Bank' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(['b'])
  })

  it('a limit above 1 keeps the latest picks and hides select-all', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataGrid
        searchLabel="Search"
        caption="Tenants"
        columns={COLUMNS}
        rows={ROWS}
        rowId={(r) => r.id}
        selectedIds={['a', 'b']}
        onSelectionChange={onSelectionChange}
        maxSelections={2}
      />,
    )
    expect(screen.queryByRole('checkbox', { name: /Select all/ })).not.toBeInTheDocument()
    expect(screen.getByText('2 of 2 selected')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Select c' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(['b', 'c'])
  })

  it('with filters on and nothing left, lists them and Clear all removes them', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.type(screen.getByRole('combobox'), 'zebra{Enter}')
    expect(screen.getByText('Nothing matches')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }))
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4)
  })

  it('no rows and no filters is the empty state, with the host’s action', () => {
    render(<Host rows={[]} emptyAction={<button type="button">Add tenant</button>} />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add tenant' })).toBeInTheDocument()
  })

  it('an error is an alert with Try again, never the empty state', () => {
    const onRetry = vi.fn()
    render(<Host error onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t load this list')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('one export format is a plain button that exports every match', () => {
    const onExport = vi.fn()
    render(<Host exportFormats={['csv']} onExport={onExport} />)
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(onExport).toHaveBeenCalledWith('csv', 'all')
  })

  it('draws pagination with rows per page, and hides it with no rows', () => {
    const page = {
      page: 1,
      size: 2,
      totalElements: 3,
      onPageChange: vi.fn(),
      onSizeChange: vi.fn(),
    }
    const { rerender } = render(<Host pagination={page} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent('1–2 of 3')
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
    rerender(<Host rows={[]} pagination={{ ...page, totalElements: 0 }} />)
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })
})

describe('termMatches', () => {
  it('is exact for a value from the data and "contains" for typed text, ignoring case', () => {
    expect(
      termMatches(
        { id: '1', field: 'name', value: 'crestview bank', exact: true },
        'Crestview Bank',
      ),
    ).toBe(true)
    expect(
      termMatches({ id: '1', field: 'name', value: 'Crest', exact: true }, 'Crestview Bank'),
    ).toBe(false)
    expect(termMatches({ id: '1', field: 'name', value: 'crest' }, 'Crestview Bank')).toBe(true)
    expect(termMatches({ id: '1', field: null, value: 'x' }, undefined)).toBe(false)
  })
})
