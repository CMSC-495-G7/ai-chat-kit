import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Switch } from './switch'

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    label: 'Show citations',
    description: 'Numbered chips link each claim to its source.',
    checked: true,
    onChange: fn(),
  },
  argTypes: { label: { control: 'text' }, description: { control: 'text' } },
  // Controlled: the story owns `checked` so the toggle actually moves.
  render: function SwitchStory(args) {
    const [on, setOn] = useState(args.checked)
    return (
      <Switch
        {...args}
        checked={on}
        onChange={(next) => {
          setOn(next)
          args.onChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Off: Story = { args: { checked: false } }

export const HiddenLabel: Story = { args: { hideLabel: true, description: undefined } }

export const Disabled: Story = { args: { disabled: true } }
