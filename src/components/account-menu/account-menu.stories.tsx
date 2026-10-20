import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DEMO_USER } from '../../fixtures/platform/user'
import { SlidersIcon, UserIcon } from '../../primitives/icons'
import { ThemeToggle } from '../../primitives/theme-toggle'
import { AccountMenu } from './account-menu'
const meta = {
  title: 'Components/Account menu',
  component: AccountMenu,
  tags: ['autodocs'],
  decorators: [
    (Story, { args }) =>
      args.trigger === 'row' ? (
        <div className="flex h-[520px] w-62 items-end bg-panel-solid p-3">
          <Story />
        </div>
      ) : (
        <div className="flex h-15 items-center bg-brand-900 px-3 dark:bg-panel-solid">
          <Story />
        </div>
      ),
  ],
  args: {
    trigger: 'avatar',
    user: { ...DEMO_USER, detail: DEMO_USER.email },
    caption: DEMO_USER.plan,
    items: [
      {
        id: 'settings',
        label: 'User settings',
        hint: 'Profile and appearance',
        icon: <UserIcon width={16} height={16} />,
        onSelect: fn(),
      },
      {
        id: 'features',
        label: 'Feature toggles',
        hint: 'What a chat response shows',
        icon: <SlidersIcon width={16} height={16} />,
        onSelect: fn(),
      },
    ],
    footer: (
      <>
        <span className="flex-1 text-[13px] font-semibold text-ink-strong">Light or dark</span>
        <ThemeToggle />
      </>
    ),
  },
} satisfies Meta<typeof AccountMenu>
export default meta
type Story = StoryObj<typeof meta>
export const Avatar: Story = {}
export const Row: Story = {
  args: { trigger: 'row' },
}
export const CollapsedRow: Story = { ...Row, args: { trigger: 'row', collapsed: true } }
