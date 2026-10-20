import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconTile } from './icon-tile'
import { ChatIcon, TriangleAlertIcon } from '../icons'
const meta = {
  title: 'Primitives/Icon tile',
  component: IconTile,
  tags: ['autodocs'],
} satisfies Meta<typeof IconTile>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { children: '✦', tone: 'soft' } }
export const Muted: Story = {
  args: { children: <ChatIcon width={17} height={17} />, tone: 'muted', size: 34 },
}
export const Warning: Story = {
  args: { children: <TriangleAlertIcon width={17} height={17} />, tone: 'warning', size: 34 },
}
