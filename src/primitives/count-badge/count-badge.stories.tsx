import type { Meta, StoryObj } from '@storybook/react-vite'
import { FunnelIcon } from '../icons'
import { CountBadge } from './count-badge'

const meta = {
  title: 'Primitives/CountBadge',
  component: CountBadge,
  tags: ['autodocs'],
  args: { count: 3, max: 99, placement: 'inline' },
  parameters: {
    docs: {
      description: {
        component:
          'A count in a pill: one digit is a circle, more widen it, and past `max` it reads “99+”. Nothing renders at zero. `corner` anchors on its left edge so extra digits grow away from the glyph.',
      },
    },
  },
} satisfies Meta<typeof CountBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Widths: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-[13px] text-ink">
      {[0, 1, 9, 42, 99, 100, 2048].map((n) => (
        <span key={n} className="flex items-center gap-1.5">
          {n}
          <CountBadge count={n} />
        </span>
      ))}
    </div>
  ),
}

export const Inline: Story = {
  render: () => (
    <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink-strong">
      Filters <CountBadge count={4} />
    </span>
  ),
}

/** The wrapper must be `relative` for the corner badge to hang off it. */
export const Corner: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {[2, 37, 120].map((n) => (
        <span
          key={n}
          className="relative grid size-8 place-items-center rounded-control text-ink-soft"
        >
          <FunnelIcon width={16} height={16} />
          <CountBadge count={n} placement="corner" />
        </span>
      ))}
    </div>
  ),
}
