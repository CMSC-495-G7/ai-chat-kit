import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '../field'
import { Select } from './select'
import type { SelectValue } from './types'

const REGIONS = [
  { value: 'us-east', label: 'US East' },
  { value: 'us-west', label: 'US West' },
  { value: 'eu-west', label: 'EU West' },
  { value: 'ap-south', label: 'AP South', disabled: true },
]

const CLIENTS = [
  { value: 'atelier-norte', label: 'Atelier Norte' },
  { value: 'casa-lumen', label: 'Casa Lumen' },
  { value: 'estudio-brava', label: 'Estudio Brava' },
  { value: 'taller-ocho', label: 'Taller Ocho (archived)', disabled: true },
]

const meta = {
  title: 'Primitives/Select',
  component: Select,
  tags: ['autodocs'],
  args: { 'aria-label': 'Region', options: REGIONS, defaultValue: 'us-east' },
  argTypes: { options: { control: 'object' } },
  parameters: {
    docs: {
      description: {
        component:
          'A button that opens a list of options — the same list in every browser. Optional actions on the label (`action`) and at the foot of the list (`listAction`). Label it with `label`, with `FieldLabel` and `htmlFor`, or with an `aria-label` in a compact toolbar.',
      },
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

function ClientPicker() {
  const [clients, setClients] = useState(CLIENTS)
  const [client, setClient] = useState<SelectValue | null>('casa-lumen')
  const add = (label: string) => {
    const value = label.toLowerCase().replace(/\W+/g, '-')
    setClients((all) => [...all.filter((c) => c.value !== value), { value, label }])
    setClient(value)
  }
  return (
    <div className="w-72">
      <Select
        label="Client"
        action={{ label: 'New client', onSelect: () => add('Nuevo Cliente') }}
        listAction={{ label: 'Import clients', onSelect: () => add('Imported Co.') }}
        options={clients}
        value={client}
        onChange={setClient}
      />
    </div>
  )
}

/** The design's main case: "New client" on the label, "Import clients" under the list. */
export const WithActions: Story = { render: () => <ClientPicker /> }

export const Placeholder: Story = {
  render: () => (
    <div className="w-72">
      <Select
        label="Client"
        action={{ label: 'New client', onSelect: () => {} }}
        placeholder="Choose a client"
        options={CLIENTS}
      />
    </div>
  ),
}

/** With no options yet, the list holds only its action. */
export const EmptyList: Story = {
  render: () => (
    <div className="w-72">
      <Select
        label="Client"
        placeholder="Choose a client"
        emptyLabel="No clients yet"
        options={[]}
        listAction={{ label: 'New client', onSelect: () => {} }}
      />
    </div>
  ),
}

/** Without an action the label reads as it always did, and rows still line up. */
export const BesideAFieldWithoutAction: Story = {
  render: () => (
    <div className="grid w-[36rem] grid-cols-2 items-start gap-6">
      <Select
        label="Client"
        action={{ label: 'New client', onSelect: () => {} }}
        defaultValue="atelier-norte"
        options={CLIENTS}
      />
      <Select
        label="Status"
        defaultValue="paid"
        options={[
          { value: 'paid', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-5">
      <Field>
        <FieldLabel htmlFor="select-sm">Rows per page</FieldLabel>
        <Select
          id="select-sm"
          size="sm"
          defaultValue={25}
          options={[10, 25, 50, 100].map((n) => ({ value: n, label: String(n) }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="select-md">Status</FieldLabel>
        <Select
          id="select-md"
          size="md"
          defaultValue="active"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'suspended', label: 'Suspended' },
          ]}
        />
      </Field>
    </div>
  ),
}

export const Groups: Story = {
  args: {
    'aria-label': 'Model',
    defaultValue: 'fast',
    options: [
      { value: 'fast', label: 'Fast', group: 'Recommended' },
      { value: 'balanced', label: 'Balanced', group: 'Recommended' },
      { value: 'long', label: 'Long context', group: 'Specialised' },
      { value: 'code', label: 'Code', group: 'Specialised' },
    ],
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <Select aria-label="Region" disabled options={REGIONS} defaultValue="us-east" />
      <Select
        label="Client"
        action={{ label: 'New client', onSelect: () => {} }}
        disabled
        defaultValue="atelier-norte"
        options={CLIENTS}
      />
    </div>
  ),
}

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'unknown',
    options: [{ value: 'unknown', label: 'Unknown region' }],
  },
}

export const InAField: Story = {
  render: () => (
    <Field data-invalid className="w-72">
      <Select
        label="Client"
        action={{ label: 'New client', onSelect: () => {} }}
        placeholder="Choose a client"
        options={CLIENTS}
        aria-invalid
        aria-describedby="client-error"
      />
      <FieldDescription>The estimate is addressed to this client.</FieldDescription>
      <FieldError id="client-error">Pick the client this sale belongs to.</FieldError>
    </Field>
  ),
}
