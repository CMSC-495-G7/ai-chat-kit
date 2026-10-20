import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../button'
import { CheckIcon, PencilIcon, SlidersIcon, TrashIcon, UserIcon } from '../icons'
import { Popover } from '../popover'
import { Menu } from './menu'
import { MenuItem } from './menu-item'

const meta = {
  title: 'Primitives/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A list of actions. `Menu` owns the arrow keys; each `MenuItem` is a glyph, a label and an optional second line. It has no pop-up of its own: put it in a `Popover` and close that when an item is chosen.',
      },
    },
  },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof Menu>

const frame = 'w-64 rounded-surface border border-line bg-panel-solid p-2'

export const WithHints: Story = {
  render: () => (
    <div className={frame}>
      <Menu aria-label="Account">
        <MenuItem
          icon={<UserIcon width={16} height={16} />}
          label="User settings"
          hint="Profile and appearance"
          onSelect={fn()}
        />
        <MenuItem
          icon={<SlidersIcon width={16} height={16} />}
          label="Feature toggles"
          hint="What a response shows"
          onSelect={fn()}
        />
      </Menu>
    </div>
  ),
}

export const LabelsOnly: Story = {
  render: () => (
    <div className={frame}>
      <Menu aria-label="Row actions">
        <MenuItem icon={<PencilIcon width={16} height={16} />} label="Rename" onSelect={fn()} />
        <MenuItem
          icon={<CheckIcon width={16} height={16} />}
          label="Mark as reviewed"
          trailing={<span className="text-xs text-ink-soft">Done</span>}
          onSelect={fn()}
        />
        <MenuItem label="Archive" disabled onSelect={fn()} />
        <MenuItem
          icon={<TrashIcon width={16} height={16} />}
          label="Delete"
          tone="danger"
          onSelect={fn()}
        />
      </Menu>
    </div>
  ),
}

/** The usual arrangement: a button, a popover, and the menu inside it. */
export const InAPopover: Story = {
  render: function InAPopoverStory() {
    const [open, setOpen] = useState(false)
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
    const choose = () => setOpen(false)
    return (
      <>
        <Button
          ref={setAnchor}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Actions
        </Button>
        <Popover
          anchor={anchor}
          open={open}
          onClose={() => setOpen(false)}
          label="Actions"
          width={240}
        >
          <Menu aria-label="Actions">
            <MenuItem
              icon={<PencilIcon width={16} height={16} />}
              label="Rename"
              onSelect={choose}
            />
            <MenuItem
              icon={<TrashIcon width={16} height={16} />}
              label="Delete"
              tone="danger"
              onSelect={choose}
            />
          </Menu>
        </Popover>
      </>
    )
  },
}
