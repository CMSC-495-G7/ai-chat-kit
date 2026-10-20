import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { FollowupChips } from './followup-chips'

const meta = {
  title: 'Chat/Components/FollowupChips',
  component: FollowupChips,
  tags: ['autodocs'],
  args: {
    items: [
      'How many days of cover after the tax payment?',
      'Who can approve a wire today?',
      'Show the reserve tier in detail',
    ],
    onPick: fn(),
    disabled: false,
  },
  decorators: [(Story) => <div className="max-w-3xl pl-10">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'Suggested next prompts in the reader’s voice, drawn as branches off the answer — a hairline spine through the orb gutter with a node per chip. A pick sends the label verbatim.',
      },
    },
  },
} satisfies Meta<typeof FollowupChips>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Single: Story = { args: { items: ['What if the second approver is out?'] } }

/** Held while a turn is in flight, so a pick can’t jump the queue. */
export const Disabled: Story = { args: { disabled: true } }
