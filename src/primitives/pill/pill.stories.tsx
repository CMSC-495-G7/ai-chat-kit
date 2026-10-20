import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchIcon, UserIcon } from '../icons'
import { Avatar } from '../avatar'
import { Button } from '../button'
import { Pill } from './pill'
import type { PillTone } from './types'

const SEMANTIC: [PillTone, string][] = [
  ['brand', 'Active'],
  ['neutral', 'Draft'],
  ['success', 'Verified'],
  ['warning', 'Pending'],
  ['danger', 'Suspended'],
]
const COLOURS: PillTone[] = ['green', 'orange', 'yellow', 'red']

const row = 'flex flex-wrap items-center gap-2.5'

const meta = {
  title: 'Primitives/Pill',
  component: Pill,
  tags: ['autodocs'],
  args: { children: 'Active', tone: 'brand', variant: 'soft', size: 'md' },
  argTypes: {
    children: { control: 'text' },
    leadingIcon: { control: false },
    avatar: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Named for the shape, not the first use. Semantic tones are named for what they mean; the literal colour tones are for when colour itself is the caller’s data. `onClick` makes the whole pill a button; `onClose` adds a separately focusable dismiss.',
      },
    },
  },
} satisfies Meta<typeof Pill>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Soft: Story = {
  render: () => (
    <div className={row}>
      {SEMANTIC.map(([tone, label]) => (
        <Pill key={tone} tone={tone}>
          {label}
        </Pill>
      ))}
    </div>
  ),
}

export const Outline: Story = {
  render: () => (
    <div className={row}>
      {SEMANTIC.map(([tone, label]) => (
        <Pill key={tone} tone={tone} variant="outline">
          {label}
        </Pill>
      ))}
    </div>
  ),
}

export const Colours: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <div className={row}>
        {COLOURS.map((tone) => (
          <Pill key={tone} tone={tone}>
            {tone} chip
          </Pill>
        ))}
      </div>
      <div className={row}>
        {COLOURS.map((tone) => (
          <Pill key={tone} tone={tone} variant="outline">
            {tone} outline
          </Pill>
        ))}
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className={row}>
      <Pill size="sm" tone="green">
        Small
      </Pill>
      <Pill size="md" tone="green">
        Medium
      </Pill>
      <Pill size="lg" tone="green">
        Large
      </Pill>
    </div>
  ),
}

export const WithDot: Story = {
  render: () => (
    <div className={row}>
      {SEMANTIC.map(([tone, label]) => (
        <Pill key={tone} tone={tone} dot>
          {label}
        </Pill>
      ))}
    </div>
  ),
}

export const WithIconOrAvatar: Story = {
  render: () => (
    <div className={row}>
      <Pill tone="brand" leadingIcon={<UserIcon />}>
        Assigned to you
      </Pill>
      <Pill tone="neutral" avatar={<Avatar variant="text" text="AN" size="xs" />}>
        Avatar chip
      </Pill>
      <Pill size="lg" variant="outline" tone="neutral" leadingIcon={<SearchIcon />}>
        Search scope
      </Pill>
    </div>
  ),
}

export const Actionable: Story = {
  render: function ActionableStory() {
    const [on, setOn] = useState(false)
    return (
      <Pill tone={on ? 'brand' : 'neutral'} aria-pressed={on} onClick={() => setOn((v) => !v)}>
        {on ? 'Selected chip' : 'Clickable chip'}
      </Pill>
    )
  },
}

export const Closable: Story = {
  render: function ClosableStory() {
    const [visible, setVisible] = useState(() => new Set(COLOURS))
    return (
      <div className={row}>
        {COLOURS.filter((t) => visible.has(t)).map((tone) => (
          <Pill
            key={tone}
            tone={tone}
            onClose={() =>
              setVisible((cur) => {
                const next = new Set(cur)
                next.delete(tone)
                return next
              })
            }
          >
            {tone} chip
          </Pill>
        ))}
        {visible.size === 0 && (
          <Button size="sm" variant="ghost" onClick={() => setVisible(new Set(COLOURS))}>
            Reset pills
          </Button>
        )}
      </div>
    )
  },
}

/** On an already-tinted surface the soft fill stops separating — use outline. */
export const OnATint: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5 rounded-control bg-chip px-3 py-2">
      <Pill tone="brand">Soft on tint</Pill>
      <Pill variant="outline" tone="brand">
        Outline on tint
      </Pill>
    </div>
  ),
}
