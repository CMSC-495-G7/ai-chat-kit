import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../../primitives/button'
import { Switch } from '../../primitives/switch'
import { SideDialog } from './side-dialog'
const meta = {
  title: 'Components/Side dialog',
  component: SideDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof SideDialog>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'User settings',
    description: 'Your profile and appearance.',
    children: 'Settings controls',
    footer: 'Reset appearance',
  },
}

/** Opened from a control. Escape, the close button and a click on the scrim
 *  all ask the host to close it; focus goes back to the control that opened it. */
export const OpenedFromAButton: Story = {
  args: {
    open: false,
    onClose: fn(),
    title: 'Feature toggles',
    description: 'Choose what a response shows. Saved on this device.',
    children: null,
  },
  render: function OpenedFromAButtonStory(args) {
    const [open, setOpen] = useState(false)
    const [sources, setSources] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open feature toggles</Button>
        <SideDialog
          {...args}
          open={open}
          onClose={() => {
            setOpen(false)
            args.onClose()
          }}
          footer={
            <Button variant="ghost" size="sm" onClick={() => setSources(true)}>
              Reset to defaults
            </Button>
          }
        >
          <Switch label="Show sources" checked={sources} onChange={setSources} />
        </SideDialog>
      </>
    )
  },
}

/** Without a footer the body runs to the bottom edge. */
export const WithoutFooter: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'About this run',
    children: (
      <p className="text-[13px] leading-5 text-ink">
        Started today by Dana Whitfield. Paused at the credit memo approval.
      </p>
    ),
  },
}

/** A long body scrolls inside the dialog; the header and footer stay put. */
export const ScrollingBody: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Release notes',
    description: 'What changed in the last few versions.',
    footer: 'Showing 30 entries',
    children: (
      <ul className="flex flex-col gap-2 text-[13px] leading-5 text-ink">
        {Array.from({ length: 30 }, (_, index) => (
          <li key={index}>Entry {index + 1}: a line long enough to wrap in the dialog's width.</li>
        ))}
      </ul>
    ),
  },
}
