import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider } from './slider'

const meta = {
  title: 'Primitives/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { 'aria-label': 'Threshold', defaultValue: 40, min: 0, max: 100, className: 'w-64' },
  parameters: {
    docs: {
      description: {
        component:
          'A native range input painted only with the semantic brand contract (`.ui-slider` in styles.css). Controlled through `value` / `onValueChange`, or uncontrolled with `defaultValue`.',
      },
    },
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const FormattedValue: Story = {
  render: function BudgetStory() {
    const [budget, setBudget] = useState(45)
    return (
      <Slider
        aria-label="Monthly budget"
        className="w-64"
        min={10}
        max={100}
        step={5}
        value={budget}
        onValueChange={setBudget}
        formatValue={(v) => `$${v}`}
      />
    )
  },
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 30 } }

export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 65 } }
