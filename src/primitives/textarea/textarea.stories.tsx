import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Instructions',
    placeholder: 'Describe how this assistant should respond…',
    className: 'w-96',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** `readOnly` keeps the text selectable and in the tab order; `disabled` does neither. */
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'Read-only notes' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Disabled notes' } }

export const Invalid: Story = {
  args: { 'aria-invalid': true, rows: 2, defaultValue: 'Invalid instructions' },
}
