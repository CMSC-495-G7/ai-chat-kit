import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { SegmentedControl } from './segmented-control'
const meta = {
  title: 'Primitives/Segmented control',
  component: SegmentedControl,
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    label: 'Canvas density',
    value: 'normal',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'compact', label: 'Compact' },
    ],
    onValueChange: () => {},
  },
}

/** Controlled: the host holds the value and gets told when a segment is pressed. */
export const Interactive: Story = {
  args: {
    label: 'Canvas density',
    value: 'normal',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'compact', label: 'Compact' },
    ],
    onValueChange: fn(),
  },
  render: function InteractiveStory(args) {
    const [value, setValue] = useState(args.value)
    return (
      <SegmentedControl
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next)
          args.onValueChange(next)
        }}
      />
    )
  },
}

/** Three choices, as a filter over a list. */
export const ThreeOptions: Story = {
  args: {
    label: 'Filter recent activity',
    value: 'all',
    options: [
      { value: 'all', label: 'Recent' },
      { value: 'chat', label: 'Conversations' },
      { value: 'workflows', label: 'Runs' },
    ],
    onValueChange: fn(),
  },
}

/** A choice that is not available stays in place, dimmed, so the control does not change shape. */
export const WithDisabledOption: Story = {
  args: {
    label: 'View',
    value: 'list',
    options: [
      { value: 'list', label: 'List' },
      { value: 'board', label: 'Board' },
      { value: 'timeline', label: 'Timeline', disabled: true },
    ],
    onValueChange: fn(),
  },
}
