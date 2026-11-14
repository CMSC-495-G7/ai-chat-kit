import { render, screen, fireEvent } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { FilterPanel } from './filter-panel'

it('keeps multi-selection when more options arrive than the presentation threshold', () => {
  const onChange = vi.fn()
  render(
    <FilterPanel
      fields={[
        {
          id: 'account',
          label: 'Accounts',
          type: 'options',
          value: ['1'],
          onChange,
          selectThreshold: 3,
          options: Array.from({ length: 12 }, (_, i) => ({
            value: String(i),
            label: `Account ${i}`,
          })),
        },
      ]}
    />,
  )
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Account 11' }))
  expect(onChange).toHaveBeenCalledWith(['1', '11'])
})
