import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CopyButton } from './copy-button'

const meta = {
  title: 'Primitives/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  args: { text: 'tnt_8f42c19b', size: 'md', onCopied: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Copy to clipboard with its own confirmation. The glyph swap is invisible to a screen reader, so a polite live region says “Copied” as well; the revert timer is cleared on unmount.',
      },
    },
  },
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Small: Story = { args: { size: 'sm', shape: 'rounded' } }

/** Custom names for both states, and a longer hold. */
export const CustomLabels: Story = {
  args: { label: 'Copy tenant ID', copiedLabel: 'Tenant ID copied', holdMs: 4000 },
}

export const InContext: Story = {
  render: (args) => (
    <div className="inline-flex items-center gap-2 rounded-control border border-line bg-panel-solid py-1 pr-1 pl-3">
      <code className="text-[12.5px] text-ink">{args.text}</code>
      <CopyButton {...args} size="sm" shape="rounded" />
    </div>
  ),
}
