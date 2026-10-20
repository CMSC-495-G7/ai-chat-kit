import type { Meta, StoryObj } from '@storybook/react-vite'
import { AmbientGlow } from './ambient-glow'

const meta = {
  title: 'Primitives/AmbientGlow',
  component: AmbientGlow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The wash behind a full-page surface: two soft blooms from opposite corners, in the palette's own glow colours. It fills its nearest positioned ancestor and sits behind everything in it, so the page needs `relative` and the glass panels on top do the rest.",
      },
    },
  },
} satisfies Meta<typeof AmbientGlow>

export default meta
type Story = StoryObj<typeof meta>

export const BehindAPage: Story = {
  render: () => (
    <div className="relative isolate flex h-[420px] gap-4 overflow-hidden bg-canvas p-4">
      <AmbientGlow />
      <div className="glass w-64 rounded-surface p-5 text-[13px] text-ink-soft">A side panel</div>
      <div className="glass flex-1 rounded-surface p-5 text-[13px] text-ink-soft">
        The main surface. Both panels are glass, so the glow shows through them.
      </div>
    </div>
  ),
}

/** On its own, so the two blooms can be seen. */
export const Alone: Story = {
  render: () => (
    <div className="relative isolate h-[420px] overflow-hidden bg-canvas">
      <AmbientGlow />
    </div>
  ),
}

/** Behind opaque cards the glow only shows in the gaps, which is why pages
 *  that want it use glass panels instead. */
export const BehindSolidPanels: Story = {
  render: () => (
    <div className="relative isolate flex h-[420px] gap-4 overflow-hidden bg-canvas p-4">
      <AmbientGlow />
      <div className="w-64 rounded-surface border border-line bg-panel-solid p-5 text-[13px] text-ink-soft">
        A solid panel
      </div>
      <div className="flex-1 rounded-surface border border-line bg-panel-solid p-5 text-[13px] text-ink-soft">
        Solid panels cover the glow; only the 16px gutters let it through.
      </div>
    </div>
  ),
}
