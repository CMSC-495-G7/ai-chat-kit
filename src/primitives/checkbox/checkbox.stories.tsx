import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './checkbox'

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Email me a weekly digest' },
  argTypes: { label: { control: 'text' }, meta: { control: 'text' } },
  parameters: {
    docs: {
      description: {
        component:
          'A native input drives a custom shell, so forms, keyboard behaviour and screen-reader state stay the platform’s. `indeterminate` is a DOM property, set through a ref, and forces `checked` off while on.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
      <Checkbox label="Checked" checked readOnly />
      <Checkbox label="Mixed" indeterminate readOnly />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled, checked" disabled checked readOnly />
    </div>
  ),
}

/** Tick one option and the header box goes mixed. */
export const SelectAllWithCounts: Story = {
  render: function SelectAllStory() {
    const all = ['active', 'pending', 'suspended'] as const
    const counts = { active: '1,109', pending: '142', suspended: '33' }
    const [picked, setPicked] = useState<string[]>(['active'])
    const allOn = picked.length === all.length
    const some = picked.length > 0 && !allOn
    return (
      <div className="flex w-64 flex-col gap-1.5">
        <Checkbox
          label="Select all"
          checked={allOn}
          indeterminate={some}
          onChange={() => setPicked(allOn ? [] : [...all])}
        />
        <div className="ml-6 flex flex-col gap-1.5">
          {all.map((value) => (
            <Checkbox
              key={value}
              label={value[0].toUpperCase() + value.slice(1)}
              meta={counts[value]}
              checked={picked.includes(value)}
              onChange={(e) =>
                setPicked((p) => (e.target.checked ? [...p, value] : p.filter((v) => v !== value)))
              }
            />
          ))}
        </div>
      </div>
    )
  },
}
