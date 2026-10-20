import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldLabel } from '../field'
import { RadioGroup, RadioGroupItem } from './radio-group'

const PLANS = [
  ['starter', 'Starter'],
  ['team', 'Team'],
  ['enterprise', 'Enterprise'],
] as const

const meta = {
  title: 'Primitives/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { name: 'plan', 'aria-label': 'Plan', orientation: 'vertical' },
  render: function RadioStory(args) {
    const [plan, setPlan] = useState('team')
    return (
      <RadioGroup {...args} value={plan} onValueChange={setPlan}>
        {PLANS.map(([value, label]) => (
          <div key={value} className="flex items-center gap-2.5">
            <RadioGroupItem id={`${args.name}-${value}`} value={value} />
            <FieldLabel htmlFor={`${args.name}-${value}`}>{label}</FieldLabel>
          </div>
        ))}
      </RadioGroup>
    )
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {}

export const Horizontal: Story = { args: { orientation: 'horizontal', name: 'plan-h' } }

export const Disabled: Story = { args: { disabled: true, name: 'plan-d' } }

export const Invalid: Story = {
  render: () => (
    <RadioGroup name="invalid-choice" defaultValue="a" aria-label="Invalid choice">
      <RadioGroupItem value="a" aria-label="Invalid option" aria-invalid="true" />
    </RadioGroup>
  ),
}
