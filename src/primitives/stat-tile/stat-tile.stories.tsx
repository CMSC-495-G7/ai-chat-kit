import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatTile } from './stat-tile'
const meta = {
  title: 'Primitives/Stat tile',
  component: StatTile,
  tags: ['autodocs'],
} satisfies Meta<typeof StatTile>
export default meta
type Story = StoryObj<typeof meta>
const tile = 'flex flex-col rounded-xl border border-line bg-panel-solid px-5 py-4'
export const Default: Story = {
  args: {
    value: 3,
    label: 'Runs in progress',
    className: 'flex flex-col rounded-xl border border-line bg-panel-solid px-5 py-4',
  },
}

/** Three across, as at the top of a list page. */
export const Row: Story = {
  args: { value: 3, label: 'Runs in progress' },
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
      <StatTile className={tile} value={3} label="Runs in progress" />
      <StatTile className={tile} value={2} label="Waiting on an approval" />
      <StatTile className={tile} value={1} label="Running without a person" />
    </div>
  ),
}

/** The count that matters most on a page, set larger and beside its label. */
export const Headline: Story = {
  args: {
    value: 2,
    label: 'approvals across Workflows',
    className: 'flex items-baseline gap-2.5',
    valueClassName: 'text-[40px] leading-none font-normal text-ink-strong tabular-nums',
    labelClassName: 'text-sm text-ink-soft',
  },
}

/** Zero is a number worth showing: it says the list was checked and is empty. */
export const Zero: Story = { args: { value: 0, label: 'Waiting on an approval', className: tile } }

/** Small, for a figure inside a card rather than a tile of its own. */
export const Compact: Story = {
  args: {
    value: '1.42x',
    label: 'DSCR',
    className: 'flex flex-col-reverse',
    valueClassName: 'text-sm font-bold text-ink-strong tabular-nums',
    labelClassName: 'text-[11px] text-ink-soft',
  },
}
