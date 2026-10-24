import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { recentChats } from '../../fixtures/recentChats'
import { ChatMenuBody } from './chat-menu-body'

const meta = {
  title: 'Chat/Components/Chat menu body',
  component: ChatMenuBody,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // Drawn the way the platform menu's panel holds it: its width and padding.
      <aside className="flex h-[640px] w-65 flex-col border-r border-line bg-panel-solid p-3">
        <Story />
      </aside>
    ),
  ],
  args: {
    inset: true,
    recentChats,
    facets: { groups: [], selection: {}, onSelectionChange: () => {}, total: 0 },
    onNewChat: fn(),
    onSelectChat: fn(),
  },
} satisfies Meta<typeof ChatMenuBody>
export default meta
type Story = StoryObj<typeof meta>

export const InThePanel: Story = {}

/** Nothing to resume: the list is empty and says how many. */
export const NoHistory: Story = { args: { recentChats: [] } }

/** On its own, with the side padding the standalone sidebar gives it. */
export const NotInset: Story = { args: { inset: false } }
