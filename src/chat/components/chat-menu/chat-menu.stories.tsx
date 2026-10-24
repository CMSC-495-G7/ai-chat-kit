import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEMO_USER } from '../../fixtures/config'
import { recentChats } from '../../fixtures/recentChats'
import { ChatMenu } from './chat-menu'
const meta = {
  title: 'Chat/Components/Chat menu',
  component: ChatMenu,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="flex h-[760px] p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    appName: 'Assistant',
    recentChats,
    facets: { groups: [], selection: {}, onSelectionChange: () => {}, total: 0 },
    account: {
      user: { ...DEMO_USER, detail: DEMO_USER.email },
      caption: DEMO_USER.plan,
      items: [],
    },
    open: true,
    collapsed: false,
    onToggleCollapse: () => {},
    onClose: () => {},
    onNewChat: () => {},
  },
} satisfies Meta<typeof ChatMenu>
export default meta
type Story = StoryObj<typeof meta>
export const Expanded: Story = {}
export const Rail: Story = { args: { collapsed: true } }
export const NoHistory: Story = { args: { recentChats: [] } }
