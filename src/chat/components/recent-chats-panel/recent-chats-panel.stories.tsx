import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { recentChats } from '../../fixtures/chat'
import { RecentChatsPanel } from './recent-chats-panel'

const meta = {
  title: 'Chat/Components/RecentChatsPanel',
  component: RecentChatsPanel,
  tags: ['autodocs'],
  args: { chats: recentChats, activeId: 'current', onSelect: fn() },
  render: function RecentStory(args) {
    const [active, setActive] = useState(args.activeId)
    return <RecentChatsPanel {...args} activeId={active} onSelect={setActive} />
  },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component: 'Recent conversations to switch between. Presentational — selection is UI-only.',
      },
    },
  },
} satisfies Meta<typeof RecentChatsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = { args: { chats: [] } }

/** One conversation: the current one, marked as such. */
export const SingleChat: Story = { args: { chats: recentChats.slice(0, 1) } }

/** Titles and snippets are cut to one line each so every row is the same height. */
export const LongTitles: Story = {
  args: {
    chats: [
      {
        id: 'current',
        title: 'Monthly liquidity position against the thirty-day policy floor, all entities',
        snippet:
          'Your operating accounts are within policy, with forty-one days of cover against the floor.',
        when: 'Active now',
      },
      {
        id: 'older',
        title: 'Wire approval limits for the treasury team after the March policy update',
        snippet: 'Two approvers are required above the single-signature limit for any wire.',
        when: 'Yesterday',
      },
    ],
  },
}
