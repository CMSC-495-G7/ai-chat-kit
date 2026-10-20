import type { Meta, StoryObj } from '@storybook/react-vite'
import { PillList } from './pill-list'
import type { PillListItem } from './types'

const tags = (labels: string[]): PillListItem[] =>
  labels.map((label) => ({ id: label.toLowerCase().replace(/\W+/g, '-'), label }))

const SPACES = tags(['Chat', 'Workflows', 'Insights', 'Ingestion', 'Search', 'Reports', 'Audit'])

const many = (n: number) => tags(Array.from({ length: n }, (_, i) => `Tag ${i + 1}`))

const meta = {
  title: 'Primitives/PillList',
  component: PillList,
  tags: ['autodocs'],
  args: { items: SPACES, max: 3, size: 'sm', variant: 'soft', overflowCap: 99 },
  argTypes: {
    items: { control: false },
    empty: { control: false },
    max: { control: { type: 'number', min: 0, step: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Pills in one line, `max` of them, then a count. Hover the list, focus the count, or tap it, and the hidden pills open in a portalled `HoverCard` (so a table cell cannot clip it). `max` runs from 0 — only the count — to `Infinity`. The count reads `+12`, and `99+` past `overflowCap`.',
      },
    },
  },
} satisfies Meta<typeof PillList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  decorators: [(Story) => <div className="pt-48">{Story()}</div>],
}

/** `max` from 0: the count alone, one pill, three, and everything. */
export const MaxPills: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 pt-4">
      {[0, 1, 3, Infinity].map((max) => (
        <div key={String(max)} className="flex items-center gap-4">
          <code className="w-20 text-[12px] text-ink-soft">max={String(max)}</code>
          <PillList {...args} max={max} />
        </div>
      ))}
    </div>
  ),
}

/** A long list says "a lot" rather than drawing a four-digit pill. */
export const LargeCounts: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 pt-4">
      {[2, 12, 99, 100, 250, 2048].map((n) => (
        <div key={n} className="flex items-center gap-4">
          <span className="w-20 text-[12px] text-ink-soft tabular-nums">{n} items</span>
          <PillList {...args} items={many(n + 2)} max={2} />
        </div>
      ))}
    </div>
  ),
}

/** Tone, variant and size are the list's; an item can override its own tone. */
export const TonesAndVariants: Story = {
  render: (args) => {
    const items: PillListItem[] = [
      { id: 'a', label: 'Active', tone: 'brand' },
      { id: 'b', label: 'Pending', tone: 'warning' },
      { id: 'c', label: 'Suspended', tone: 'danger' },
      { id: 'd', label: 'Verified', tone: 'success' },
      { id: 'e', label: 'Draft' },
    ]
    return (
      <div className="flex flex-col gap-3 pt-4">
        <PillList {...args} items={items} max={3} variant="soft" />
        <PillList {...args} items={items} max={3} variant="outline" />
        <PillList {...args} items={items} max={3} variant="outline" size="md" />
      </div>
    )
  },
}

/** Pills give up width before the count does: a long tag truncates, the count stays. */
export const InANarrowCell: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 pt-4">
      <div className="w-56 overflow-hidden rounded-control border border-line p-2">
        <PillList
          {...args}
          max={3}
          items={tags(['Commercial real estate lending', 'Treasury', 'Wire transfers', 'Audit'])}
        />
      </div>
    </div>
  ),
}

export const Empty: Story = {
  args: {
    items: [],
    empty: <span className="text-[13px] text-ink-soft">No tags</span>,
  },
}
