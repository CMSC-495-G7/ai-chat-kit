import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DotsIcon, PencilIcon, TrashIcon } from '../icons'
import { IconButton } from './icon-button'

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    'aria-label': 'More actions',
    size: 'md',
    shape: 'circle',
    active: false,
    onClick: fn(),
    children: <DotsIcon width={16} height={16} />,
  },
  argTypes: { children: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Fixed hit boxes, not padding: `sm` 32 (clears WCAG 2.2 SC 2.5.8), `md` 36, `lg` 44 (Apple HIG touch minimum). The glyph can stay as small as the design wants. Always give it an `aria-label`.',
      },
    },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} size="sm" aria-label="Small" />
      <IconButton {...args} size="md" aria-label="Medium" />
      <IconButton {...args} size="lg" aria-label="Large" />
    </div>
  ),
}

export const Shapes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} shape="circle" aria-label="Circle" />
      <IconButton {...args} shape="rounded" aria-label="Rounded" />
    </div>
  ),
}

export const Active: Story = { args: { active: true } }

export const Disabled: Story = { args: { disabled: true } }

/** A table's trailing row controls — `sm` + `rounded`, the DataTable default. */
export const RowActions: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <IconButton size="sm" shape="rounded" aria-label="Edit Crestview Bank" title="Edit">
        <PencilIcon width={14} height={14} />
      </IconButton>
      <IconButton size="sm" shape="rounded" aria-label="Delete Crestview Bank" title="Delete">
        <TrashIcon width={14} height={14} />
      </IconButton>
      <IconButton
        size="sm"
        shape="rounded"
        aria-label="More actions for Crestview Bank"
        title="More"
      >
        <DotsIcon width={14} height={14} />
      </IconButton>
    </div>
  ),
}
