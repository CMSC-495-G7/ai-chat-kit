import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FacetFilters } from './facet-filters'
import type { FacetFiltersProps } from './types'

const base: FacetFiltersProps = {
  groups: [
    {
      key: 'accounts',
      label: 'Accounts',
      searchable: true,
      values: [
        { value: 'a', label: 'Available', count: 10 },
        { value: 'b', label: 'Unavailable', count: 0 },
        { value: 'c', label: 'Selected zero', count: 0 },
      ],
    },
  ],
  selection: { accounts: ['c'] },
  onSelectionChange: vi.fn(),
  total: 10,
}

describe('consumer facet controls', () => {
  it('omitted label and layout values retain usable defaults', () => {
    render(
      <FacetFilters
        {...base}
        labels={{ itemsInScope: undefined, groupSummary: undefined }}
        layout={{ listPreview: undefined, windowRows: undefined }}
      />,
    )
    expect(screen.getByText('10 items in scope')).toBeVisible()
    expect(screen.getByRole('checkbox', { name: /^Available/ })).toBeEnabled()
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
  })
  it('hiding the unavailable toggle keeps zero-count rows visible by default', () => {
    render(<FacetFilters {...base} showUnavailableToggle={false} />)
    expect(screen.queryByRole('button', { name: 'Hide unavailable' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /^Unavailable/ })).toBeDisabled()
  })
  it('can hide unavailable rows while keeping a selected zero-count row removable', () => {
    render(<FacetFilters {...base} showUnavailableToggle={false} defaultShowUnavailable={false} />)
    expect(screen.queryByRole('checkbox', { name: /^Unavailable/ })).not.toBeInTheDocument()
    const selected = screen.getByRole('checkbox', { name: /^Selected zero/ })
    expect(selected).toBeEnabled()
    fireEvent.click(selected)
    expect(base.onSelectionChange).toHaveBeenCalledWith({})
  })
  it('can override row visibility for one group and remove optional panel chrome', () => {
    render(
      <FacetFilters
        {...base}
        groups={base.groups.map((g) => ({ ...g, defaultShowUnavailable: true }))}
        defaultShowUnavailable={false}
        showHeader={false}
        showSearch={false}
        showTotal={false}
        showActiveFilters={false}
        showSelectAll={false}
        showSelectionHints={false}
      />,
    )
    expect(screen.getByRole('checkbox', { name: /^Unavailable/ })).toBeDisabled()
    expect(screen.queryByRole('textbox', { name: 'Find a filter…' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Filter Accounts options' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /^Select all/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
    expect(screen.queryByText(/items in scope/)).not.toBeInTheDocument()
  })
  it('hiding count labels preserves availability without announcing hidden counts', () => {
    render(<FacetFilters {...base} showCounts={false} />)
    expect(screen.getByRole('checkbox', { name: 'Available' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Unavailable' })).toBeDisabled()
    expect(screen.queryByText(/10 results/)).not.toBeInTheDocument()
  })
  it('hiding global search removes its existing query from filtering', () => {
    const { rerender } = render(<FacetFilters {...base} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Find a filter…' }), {
      target: { value: 'no match' },
    })
    expect(screen.queryByRole('checkbox', { name: /^Available/ })).not.toBeInTheDocument()
    rerender(<FacetFilters {...base} showSearch={false} />)
    expect(screen.getByRole('checkbox', { name: /^Available/ })).toBeVisible()
  })
  it('clear-all reaches every controlled selection type without a combined handler', () => {
    const onRemoveQuery = vi.fn(),
      onRemoveCustomFacet = vi.fn()
    const query = { groupKey: 'accounts', query: 'all', count: 1000 }
    render(
      <FacetFilters
        {...base}
        queries={[query]}
        customFacets={[{ id: 'custom', type: 'Amount', value: '5' }]}
        onRemoveQuery={onRemoveQuery}
        onRemoveCustomFacet={onRemoveCustomFacet}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /^Clear all$/ }))
    expect(base.onSelectionChange).toHaveBeenCalledWith({})
    expect(onRemoveQuery).toHaveBeenCalledWith(query)
    expect(onRemoveCustomFacet).toHaveBeenCalledWith('custom')
  })
  it('does not offer inert remove buttons on query/custom chips', () => {
    render(
      <FacetFilters
        {...base}
        queries={[{ groupKey: 'accounts', query: 'all' }]}
        customFacets={[{ id: 'custom', type: 'Amount', value: '5' }]}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Remove the all search filter' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Remove the Amount 5 filter' }),
    ).not.toBeInTheDocument()
  })
  it('assigns independent labels to controls when two instances are mounted', () => {
    const props = {
      ...base,
      facetTypes: ['Amount'],
      onAddCustomFacet: vi.fn(),
      scope: {
        label: 'Range',
        value: 'all',
        options: [{ value: 'all', label: 'All' }],
        onChange: vi.fn(),
      },
    }
    render(
      <>
        <FacetFilters {...props} />
        <FacetFilters {...props} />
      </>,
    )
    const ids = screen.getAllByRole('combobox').map((el) => el.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(screen.getAllByLabelText('Facet type')).toHaveLength(2)
    expect(screen.getAllByLabelText('Range')).toHaveLength(2)
  })
})
