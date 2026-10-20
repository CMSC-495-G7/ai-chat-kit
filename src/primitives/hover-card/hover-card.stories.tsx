import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useHoverCard } from '../../hooks/useHoverCard'
import { HoverCard } from './hover-card'

const meta = {
  title: 'Primitives/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A generic anchored card, portalled out of whatever clips it. Owns placement — above by default, flips and clamps to fit — and stays open while the pointer is on it (WCAG 1.4.13). State comes from `useHoverCard`: spread `anchorProps` on the trigger and `cardProps` on the card.',
      },
    },
  },
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof HoverCard>

function Demo({
  maxWidth,
  maxHeight,
  long,
}: {
  maxWidth?: number
  maxHeight?: number
  long?: boolean
}) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const { open, anchorProps, cardProps } = useHoverCard()
  return (
    <p className="max-w-lg text-[14px] leading-relaxed text-ink">
      Debt service coverage held at 1.38× over three years{' '}
      <button
        ref={setAnchor}
        type="button"
        {...anchorProps}
        className="rounded-control bg-chip px-1.5 text-[12px] font-bold text-chip-fg"
      >
        [2]
      </button>
      , though revenue fell 18% year over year.
      <HoverCard
        anchor={anchor}
        open={open}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        {...cardProps}
      >
        <div className="flex flex-col gap-1.5 p-3 text-[12.5px] leading-relaxed text-ink">
          <strong className="text-ink-strong">2025 financial statements · p. 4</strong>
          <span>
            Net operating income of $512,400 against annual debt service of $371,300 yields a
            coverage ratio of 1.38×.
          </span>
          {long &&
            Array.from({ length: 12 }, (_, i) => (
              <span key={i}>
                Supporting paragraph {i + 1}: the card scrolls inside its own height cap rather than
                growing past the viewport.
              </span>
            ))}
        </div>
      </HoverCard>
    </p>
  )
}

/** Hover or focus the citation chip. Move onto the card — it stays. */
export const Citation: Story = { render: () => <Demo maxWidth={320} /> }

export const ScrollingBody: Story = { render: () => <Demo maxWidth={320} maxHeight={200} long /> }

/** With room above the anchor the card opens upward, which is its preference.
 *  The other stories sit at the top of the page, so there it flips below. */
export const AboveWhenThereIsRoom: Story = {
  render: () => (
    <div className="pt-72">
      <Demo maxWidth={320} />
    </div>
  ),
}

/** A narrow card for a short note; width is a cap, not a fixed size. */
export const Narrow: Story = { render: () => <Demo maxWidth={220} /> }
