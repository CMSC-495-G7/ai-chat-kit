import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../../primitives/button'
import { SlideOver } from './slide-over'
const meta = {
  title: 'Components/Slide over',
  component: SlideOver,
  tags: ['autodocs'],
} satisfies Meta<typeof SlideOver>
export default meta
type Story = StoryObj<typeof meta>
const frame = (Story: () => React.ReactNode) => (
  <div className="relative h-96 overflow-hidden rounded-surface border border-line bg-canvas">
    <Story />
  </div>
)
export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    label: 'Menu',
    children: <div className="w-62 bg-panel-solid p-4">Navigation</div>,
  },
  decorators: [
    (Story) => (
      <div className="relative h-96">
        <Story />
      </div>
    ),
  ],
}

/** From the right, for a detail panel rather than a menu. */
export const FromTheRight: Story = {
  args: {
    open: true,
    onClose: fn(),
    label: 'References',
    side: 'right',
    children: <div className="w-80 bg-panel-solid p-4 text-sm text-ink">Reference panel</div>,
  },
  decorators: [frame],
}

/** Opened from a control. Focus moves into the panel and is kept there; Escape
 *  or a click on the scrim closes it and puts focus back on the control. */
export const OpenedFromAButton: Story = {
  args: { open: false, onClose: fn(), label: 'Menu', children: null },
  decorators: [frame],
  render: function OpenedFromAButtonStory(args) {
    const [open, setOpen] = useState(false)
    return (
      <>
        <div className="p-4">
          <Button onClick={() => setOpen(true)}>Open menu</Button>
        </div>
        <SlideOver
          {...args}
          open={open}
          onClose={() => {
            setOpen(false)
            args.onClose()
          }}
        >
          <nav className="flex w-62 flex-col gap-1 bg-panel-solid p-3 text-sm">
            <a href="#home" className="rounded-control px-2.5 py-2.5 font-medium text-ink">
              Home
            </a>
            <a href="#tasks" className="rounded-control px-2.5 py-2.5 font-medium text-ink">
              Tasks
            </a>
            <a href="#chat" className="rounded-control px-2.5 py-2.5 font-medium text-ink">
              Chat
            </a>
          </nav>
        </SlideOver>
      </>
    )
  },
}

/** Without the shadow and with a lighter scrim, when the panel already has an edge. */
export const Quiet: Story = {
  args: {
    open: true,
    onClose: fn(),
    label: 'Filters',
    shadow: false,
    scrimClassName: 'bg-scrim/10',
    children: (
      <div className="w-72 border-r border-line bg-panel-solid p-4 text-sm text-ink">Filters</div>
    ),
  },
  decorators: [frame],
}
