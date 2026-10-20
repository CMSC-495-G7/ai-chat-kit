import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThinkingBlock } from './thinking-block'

const TEXT =
  'The policy sets a floor in days of forecast outflows. I need the current balance and the run rate, then compare. The Q2 report has both; the runbook matters only if a large wire is needed.'

const meta = {
  title: 'Chat/Components/ThinkingBlock',
  component: ThinkingBlock,
  tags: ['autodocs'],
  args: { text: TEXT, active: false, durationSec: 3 },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'The collapsible reasoning panel above an answer — shimmering “Thinking…” while active, “Reasoning paused” while stepped aside for a tool call, and “Thought for Ns” only once reasoning has genuinely finished.',
      },
    },
  },
} satisfies Meta<typeof ThinkingBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Finished: Story = {}

export const Active: Story = { args: { active: true, durationSec: undefined } }

/** Not active and no duration yet: reasoning handed off to a tool call. */
export const Paused: Story = { args: { active: false, durationSec: undefined } }
