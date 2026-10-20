import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { FormatIcon, PencilIcon, PlusIcon, TrashIcon } from '../icons'
import { AdaptiveButton } from './adaptive-button'
import { Button } from './button'
import { ButtonLink } from './button-link'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Save changes', onClick: fn() },
  argTypes: {
    icon: { control: false },
    trailingIcon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Heights, not padding — 32 / 36 / 44, matching `IconButton` exactly so the two share a row without a half-pixel step. Presentational: no loading state and no `href` form.',
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
    </div>
  ),
}

/** `inverse` sits on a brand fill — the bulk bar, a banner. */
export const Inverse: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 rounded-control bg-brand-solid px-3 py-2">
      <span className="text-[13px] font-bold text-on-brand-solid">3 selected</span>
      <Button {...args} variant="inverse" size="sm">
        Change status
      </Button>
      <Button {...args} variant="inverse" size="sm">
        Assign owner
      </Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button {...args} size="sm">
        Small 32
      </Button>
      <Button {...args} size="md">
        Medium 36
      </Button>
      <Button {...args} size="lg">
        Large 44
      </Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button {...args} variant="primary" icon={<PlusIcon width={13} height={13} />}>
        New tenant
      </Button>
      <Button {...args} icon={<PencilIcon width={13} height={13} />}>
        Edit
      </Button>
      <Button {...args} variant="danger" icon={<TrashIcon width={13} height={13} />}>
        Delete
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button {...args} variant="primary" disabled>
        Primary
      </Button>
      <Button {...args} disabled>
        Secondary
      </Button>
      <Button {...args} variant="ghost" disabled>
        Ghost
      </Button>
      <Button {...args} variant="destructive" disabled>
        Destructive
      </Button>
    </div>
  ),
}

export const Block: Story = {
  args: { block: true, variant: 'primary', children: 'Continue' },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
}

/**
 * One native button that drops its visible label inside a narrow `@container`.
 * The accessible name stays; the tooltip carries the label instead. Drag the
 * width below to watch it collapse.
 */
export const Adaptive: Story = {
  render: function AdaptiveStory() {
    const [width, setWidth] = useState(560)
    const [formatted, setFormatted] = useState(false)
    return (
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 text-[12px] text-ink-soft">
          Container width
          <input
            type="range"
            min={200}
            max={720}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <span className="tabular-nums">{width}px</span>
        </label>
        <div
          className="@container flex min-w-0 items-center gap-2 overflow-hidden rounded-control border border-line bg-tint/3 p-2"
          style={{ width }}
        >
          <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">
            Diff toolbar action
          </span>
          <AdaptiveButton
            size="sm"
            variant="ghost"
            icon={<FormatIcon width={16} height={16} />}
            label={formatted ? 'Raw view' : 'Format view'}
            tooltip={formatted ? 'Show raw comparison' : 'Format comparison view'}
            aria-pressed={formatted}
            onClick={() => setFormatted((v) => !v)}
          />
        </div>
      </div>
    )
  },
}

export const Link: Story = {
  render: () => (
    <ButtonLink href="#destination" variant="primary">
      Open destination
    </ButtonLink>
  ),
}
