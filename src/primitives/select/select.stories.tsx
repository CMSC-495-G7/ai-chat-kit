import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, FieldLabel } from '../field'
import { Select } from './select'

const REGIONS = [
  { value: 'us-east', label: 'US East' },
  { value: 'us-west', label: 'US West' },
  { value: 'eu-west', label: 'EU West' },
  { value: 'ap-south', label: 'AP South', disabled: true },
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
          'A native `<select>` with the platform arrow replaced. Label-agnostic: pair it with `FieldLabel` in a form, or give it an `aria-label` in a compact toolbar.',
      },
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

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
  render: () => (
    <Select aria-label="Model" defaultValue="fast">
      <optgroup label="Recommended">
        <option value="fast">Fast</option>
        <option value="balanced">Balanced</option>
      </optgroup>
      <optgroup label="Specialised">
        <option value="long">Long context</option>
        <option value="code">Code</option>
      </optgroup>
    </Select>
  ),
}

export const Disabled: Story = { args: { disabled: true } }

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'unknown',
    options: [{ value: 'unknown', label: 'Unknown region' }],
  },
}
