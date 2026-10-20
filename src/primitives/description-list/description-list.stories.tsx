import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pill } from '../pill'
import { DescriptionList } from './description-list'
const meta = {
  title: 'Primitives/Description list',
  component: DescriptionList,
  tags: ['autodocs'],
} satisfies Meta<typeof DescriptionList>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    rows: [
      ['Run', 'Commercial loan review'],
      ['Stage', 'Credit approval'],
    ],
    className: 'grid grid-cols-[92px_minmax(0,1fr)] gap-x-3.5 gap-y-1.5',
  },
}

/** Term on the left, detail pushed right: the arrangement a narrow card uses. */
export const SplitRows: Story = {
  args: {
    rows: [
      ['Run', 'Commercial loan review'],
      ['Stage', 'Approve'],
      ['Requested by', 'Dana Whitfield, Credit analyst'],
      ['Tenant', 'Alderfinch Treasury'],
    ],
    className: 'flex w-80 flex-col text-sm',
    rowClassName: 'flex justify-between gap-4 py-1.5',
    termClassName: 'text-ink-soft',
    detailClassName: 'text-right font-semibold text-ink-strong',
  },
}

/** A detail is any node, so a status can be a pill rather than a word. */
export const WithRichDetails: Story = {
  args: {
    rows: [
      [
        'Status',
        <Pill key="status" tone="warning">
          Needs approval
        </Pill>,
      ],
      [
        'Amount',
        <span key="amount" className="tabular-nums">
          $4,200,000
        </span>,
      ],
      [
        'Reference',
        <code key="reference" className="font-mono text-[12.5px]">
          LN-2291
        </code>,
      ],
    ],
    className: 'grid grid-cols-[92px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2',
  },
}

/** A long detail wraps inside its column instead of pushing the terms about. */
export const LongValues: Story = {
  args: {
    rows: [
      ['Summary', 'Leverage is above the 4.0x guideline, offset by a first lien on receivables.'],
      ['Mitigant', 'Quarterly covenant testing, with a cash sweep above 3.5x.'],
    ],
    className: 'grid w-96 grid-cols-[92px_minmax(0,1fr)] gap-x-3.5 gap-y-1.5',
  },
}
