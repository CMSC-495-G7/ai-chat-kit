import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { Orb } from '../orb'
import { EmptyState } from './empty-state'
const meta = {
  title: 'Primitives/Empty state',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    title: 'Nothing here yet',
    body: 'Items will appear here when they are available.',
    className: 'flex flex-col gap-2 p-6',
    titleClassName: 'text-lg font-semibold text-ink-strong',
    bodyClassName: 'text-sm text-ink-soft',
  },
}

/** Says what to do next, and offers it. An empty state without a way out is a dead end. */
export const WithAction: Story = {
  args: {
    title: 'No sources yet',
    body: 'Connect an API or upload documents to give this tenant something to answer from.',
    className:
      'flex max-w-xl flex-col items-start gap-3 rounded-xl border border-dashed border-line px-6 py-8',
    titleClassName: 'text-lg font-semibold text-ink-strong',
    bodyClassName: 'text-[15px] leading-relaxed text-ink',
    children: <Button variant="primary">Add a source</Button>,
  },
}

/** One quiet line, for a list that simply has nothing in it. */
export const BodyOnly: Story = {
  args: {
    body: 'Nothing in Alderfinch Retail is waiting on you.',
    className: 'px-3 py-8',
    bodyClassName: 'text-sm text-ink-soft',
  },
}

/** Centred in a panel, with the mark above the copy. */
export const CentredInAPanel: Story = {
  render: () => (
    <div className="flex h-72 w-[400px] rounded-surface border border-line bg-panel-solid">
      <EmptyState
        className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center"
        body="Select a step on the canvas to see what it produced and what it is waiting on."
        bodyClassName="text-[13px] leading-5 text-ink-soft"
      >
        <Orb className="order-first block size-8 opacity-40" />
      </EmptyState>
    </div>
  ),
}
