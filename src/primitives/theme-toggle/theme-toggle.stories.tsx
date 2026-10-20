import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeToggle } from './theme-toggle'

const meta = {
  title: 'Primitives/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component:
          'The light / dark switch. It writes the `dark` and `light` classes on `<html>` and remembers the choice under `THEME_MODE_KEY`, the same key `brand/head.html` reads before first paint. In Storybook the toolbar owns the mode, so pressing it here and then changing the toolbar puts the toolbar back in charge.',
      },
    },
  },
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Where it usually sits: the last control in a bar. */
export const InABar: Story = {
  render: () => (
    <div className="flex h-14 w-full max-w-xl items-center gap-3 rounded-surface border border-line bg-panel-solid px-4">
      <span className="text-[13px] font-bold text-ink-strong">Commercial loan review</span>
      <span className="flex-1" />
      <ThemeToggle />
    </div>
  ),
}

/** As a row in a menu, with the words that say what it changes. */
export const InAMenuRow: Story = {
  render: () => (
    <div className="flex w-64 items-center gap-3 rounded-surface border border-line bg-panel-solid px-3 py-2.5">
      <span className="flex-1 text-[13px] font-semibold text-ink-strong">Light or dark</span>
      <ThemeToggle />
    </div>
  ),
}
