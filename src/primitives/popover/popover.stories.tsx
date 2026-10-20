import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { Popover } from './popover'
import type { PopoverAlign } from './types'

const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A panel anchored to a control. It is portalled into the overlay layer, so a clipped or blurred ancestor cannot cut it off, and placed with fixed coordinates measured from the anchor. Escape closes it and returns focus to the anchor; so does a press anywhere outside the panel and the anchor. The host holds `open` and the anchor element.',
      },
    },
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof Popover>

function Demo({ align, width = 260 }: { align: PopoverAlign; width?: number }) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  return (
    <>
      <Button
        ref={setAnchor}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Open'} · {align}
      </Button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label="Example panel"
        width={width}
        align={align}
      >
        <p className="px-3 pt-2 pb-1 text-sm font-bold text-ink-strong">A panel</p>
        <p className="px-3 pb-2 text-[13px] leading-5 text-ink-soft">
          Whatever the host puts here. Press Escape, or click outside, to close it.
        </p>
      </Popover>
    </>
  )
}

/** Below the anchor, lined up with its left edge. The default. */
export const Start: Story = { render: () => <Demo align="start" /> }

/** Below the anchor, lined up with its right edge — for a control at the end of a bar. */
export const End: Story = {
  render: () => (
    <div className="flex justify-end">
      <Demo align="end" />
    </div>
  ),
}

/** To the right of the anchor, level with its top — for a control in a narrow rail. */
export const Side: Story = { render: () => <Demo align="side" width={220} /> }

/** Rising from an anchor pinned to the bottom of the screen. */
export const Above: Story = {
  render: () => (
    <div className="flex h-64 items-end">
      <Demo align="above" />
    </div>
  ),
}
