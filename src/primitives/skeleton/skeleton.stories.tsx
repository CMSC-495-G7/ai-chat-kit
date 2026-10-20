import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'
const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { className: 'h-4 w-48', 'aria-hidden': true } }

/** Lines of uneven length read as text; equal ones read as a table. */
export const Paragraph: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2" aria-hidden>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  ),
}

/** The caller sets the shape: a circle for an avatar, a rounded box for a control. */
export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4" aria-hidden>
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-control" />
      <Skeleton className="h-5 w-16 rounded-control" />
    </div>
  ),
}

/** Standing in for a card while its content loads, so the layout does not jump. */
export const CardPlaceholder: Story = {
  render: () => (
    <div
      className="flex w-80 flex-col gap-3 rounded-surface border border-line bg-panel-solid p-4"
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-control" />
      </div>
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
  ),
}
