import type { Meta, StoryObj } from '@storybook/react-vite'
import { Greeting } from './greeting'
const meta = {
  title: 'Chat/Components/Greeting',
  component: Greeting,
  tags: ['autodocs'],
  args: { name: 'Joe', salutation: 'Good morning' },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof Greeting>
export default meta
type Story = StoryObj<typeof meta>
export const Morning: Story = {}
export const Evening: Story = { args: { salutation: 'Good evening' } }

/** With no salutation it reads the clock: morning, afternoon or evening. */
export const FromTheClock: Story = { args: { salutation: undefined } }

/** A long name wraps under the salutation rather than shrinking. */
export const LongName: Story = {
  args: { name: 'Alexandria Montgomery-Whitfield' },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
}

/** Nobody signed in: the salutation stands alone. */
export const WithoutAName: Story = { args: { name: undefined } }

/** The widget's version: the date and the headline at panel width, as an h2. */
export const Compact: Story = {
  args: { compact: true },
  decorators: [(Story) => <div className="max-w-[360px]">{Story()}</div>],
}
