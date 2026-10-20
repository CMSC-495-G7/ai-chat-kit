import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyButton } from '../../../primitives/copy-button'
import { IconButton } from '../../../primitives/icon-button'
import { RefreshIcon, ThumbDownIcon, ThumbUpIcon } from '../../../primitives/icons'
import { MessageActions } from './message-actions'

const actions = (
  <>
    <CopyButton text="Your operating accounts are within policy." size="sm" />
    <IconButton size="sm" aria-label="Regenerate" title="Regenerate">
      <RefreshIcon width={14} height={14} />
    </IconButton>
  </>
)

const meta = {
  title: 'Chat/Components/MessageActions',
  component: MessageActions,
  tags: ['autodocs'],
  args: { children: actions, reveal: false },
  argTypes: { children: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'The row of controls under a message. `reveal` hides it with opacity rather than `display`, so it keeps its place in the tab order and the transcript doesn’t jump when a pointer crosses it. The turn must carry `group/turn`.',
      },
    },
  },
} satisfies Meta<typeof MessageActions>

export default meta
type Story = StoryObj<typeof meta>

export const AlwaysShown: Story = {}

/** Hover the turn, or tab into it, to reveal the row. */
export const RevealOnHover: Story = {
  args: { reveal: true },
  render: (args) => (
    <div className="group/turn max-w-md rounded-surface border border-dashed border-line p-4">
      <p className="text-[14px] text-ink">Hover this turn to reveal its actions.</p>
      <MessageActions {...args} />
    </div>
  ),
}

/** The full row under a finished answer: copy, regenerate, and the two votes. */
export const UnderAnAnswer: Story = {
  render: (args) => (
    <div className="max-w-md">
      <p className="text-[14px] leading-relaxed text-ink">
        Your operating accounts are within policy: 41 days of cover against a 30-day floor.
      </p>
      <MessageActions {...args} className="mt-2">
        {actions}
        <IconButton size="sm" aria-label="Good answer" title="Good answer">
          <ThumbUpIcon width={14} height={14} />
        </IconButton>
        <IconButton size="sm" aria-label="Bad answer" title="Bad answer">
          <ThumbDownIcon width={14} height={14} />
        </IconButton>
      </MessageActions>
    </div>
  ),
}

/** One action is still a row, so a later second one does not move it. */
export const SingleAction: Story = {
  args: { children: <CopyButton text="Who can approve a wire today?" size="sm" /> },
}
