import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { FilterChip } from './filter-chip'

const meta = {
  title: 'Primitives/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  args: { label: 'Delta Air Lines', prefix: 'Merchant', tone: 'value', on: 'panel' },
  parameters: {
    docs: {
      description: {
        component:
          'Three shapes for three promises. `value` — the index vouched for it. `query` — a predicate standing in for a selection too large to list. `custom` — typed by hand, dashed because it carries no count.',
      },
    },
  },
} satisfies Meta<typeof FilterChip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip tone="value" prefix="Account" label="Payroll" />
      <FilterChip tone="query" prefix="Loan Number contains" label="1772" count={4108} />
      <FilterChip tone="custom" prefix="Tag" label="q3-offsite" />
    </div>
  ),
}

export const Removable: Story = {
  args: { onRemove: fn(), removeLabel: 'Remove Merchant: Delta Air Lines' },
}

/** On a chip-tinted surface the value chip lifts to the panel colour. */
export const OnTint: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2 rounded-control bg-chip px-3 py-2">
      <FilterChip tone="value" prefix="Account" label="Payroll" on="tint" onRemove={() => {}} />
      <FilterChip tone="query" prefix="Loan Number contains" label="1772" count={4108} on="tint" />
      <FilterChip tone="custom" prefix="Tag" label="q3-offsite" on="tint" />
    </div>
  ),
}
