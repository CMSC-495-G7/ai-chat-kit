import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import type { DateRange } from '../../primitives/date-field'
import { FilterPanel } from './filter-panel'
import type { FilterField, FilterPanelProps } from './types'

/** A host that owns every value — the panel itself stores nothing. */
function Host(props: Partial<FilterPanelProps>) {
  const [status, setStatus] = useState<string[]>(['active'])
  const [tier, setTier] = useState<string[]>([])
  const [owner, setOwner] = useState<string[]>([])
  const [region, setRegion] = useState('')
  const [seated, setSeated] = useState(false)
  const [renewal, setRenewal] = useState<string | null>(null)
  const [created, setCreated] = useState<DateRange>({ from: null, to: null })
  const [pinned, setPinned] = useState(props.pinned ?? true)

  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: status,
      onChange: setStatus,
      options: [
        { value: 'active', label: 'Active', count: 9 },
        { value: 'pending', label: 'Pending', count: 3 },
        { value: 'suspended', label: 'Suspended', count: 2 },
      ],
    },
    {
      id: 'tier',
      label: 'Plan tier',
      type: 'options',
      multiple: false,
      value: tier,
      onChange: setTier,
      options: [
        { value: 'Enterprise', label: 'Enterprise', count: 5 },
        { value: 'Growth', label: 'Growth', count: 6 },
        { value: 'Starter', label: 'Starter', count: 3 },
      ],
    },
    {
      id: 'owner',
      label: 'Account owner',
      type: 'options',
      hint: 'More options than the threshold, so it renders as a select.',
      value: owner,
      onChange: setOwner,
      selectThreshold: 6,
      options: Array.from({ length: 14 }, (_, i) => ({ value: `o${i}`, label: `Owner ${i + 1}` })),
    },
    {
      id: 'region',
      label: 'Region',
      type: 'string',
      value: region,
      onChange: setRegion,
      placeholder: 'Any region',
    },
    {
      id: 'seated',
      label: 'Has active seats',
      type: 'boolean',
      hint: 'Hide tenants with nobody signed in',
      value: seated,
      onChange: setSeated,
    },
    { id: 'renewal', label: 'Renews before', type: 'date', value: renewal, onChange: setRenewal },
    { id: 'created', label: 'Created', type: 'dateRange', value: created, onChange: setCreated },
  ]

  const active =
    status.length +
    tier.length +
    owner.length +
    (region ? 1 : 0) +
    (seated ? 1 : 0) +
    (renewal ? 1 : 0) +
    (created.from || created.to ? 1 : 0)

  return (
    <FilterPanel
      fields={fields}
      activeCount={active}
      onReset={() => {
        setStatus([])
        setTier([])
        setOwner([])
        setRegion('')
        setSeated(false)
        setRenewal(null)
        setCreated({ from: null, to: null })
      }}
      {...props}
      pinned={pinned}
      onPinnedChange={setPinned}
    />
  )
}

const meta = {
  title: 'Components/FilterPanel',
  component: FilterPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Every filter type the table supports — `string`, `options` (many or one), `boolean`, `date`, `dateRange` — described as data. The same panel docks beside the table or floats over it, so a field added to one is never missing from the other. Counts are optional and never faked.',
      },
    },
  },
} satisfies Meta<typeof FilterPanel>

export default meta
type Story = StoryObj<typeof FilterPanel>

export const Pinned: Story = {
  render: () => (
    <div className="w-60">
      <Host pinned />
    </div>
  ),
}

/** Floating: a close button appears and it casts a shadow over the table. */
export const Floating: Story = {
  render: () => (
    <div className="w-[19rem]">
      <Host pinned={false} onClose={fn()} className="shadow-[0_12px_32px_var(--shadow-raised)]" />
    </div>
  ),
}

/** A host with three dates: two that look back and one that looks ahead. */
function DatesHost(props: Partial<FilterPanelProps>) {
  const none: DateRange = { from: null, to: null }
  const [created, setCreated] = useState<DateRange>(none)
  const [updated, setUpdated] = useState<DateRange>(none)
  const [renewal, setRenewal] = useState<DateRange>(none)
  return (
    <FilterPanel
      title="Filters"
      fields={[
        {
          id: 'created',
          label: 'Created',
          type: 'dateRange',
          presets: true,
          value: created,
          onChange: setCreated,
        },
        {
          id: 'updated',
          label: 'Last updated',
          type: 'dateRange',
          presets: true,
          value: updated,
          onChange: setUpdated,
        },
        {
          id: 'renewal',
          label: 'Renewal',
          type: 'dateRange',
          presets: true,
          direction: 'future',
          hint: 'Tenants with no renewal date are left out.',
          value: renewal,
          onChange: setRenewal,
        },
      ]}
      pinned
      {...props}
    />
  )
}

/**
 * Two or more dates share one "Dates" section, folded into rows that say what each is set to.
 * One row is open at a time. A date that looks ahead offers picks that look ahead.
 */
export const SeveralDates: Story = {
  render: () => (
    <div className="w-64">
      <DatesHost />
    </div>
  ),
}
