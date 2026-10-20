import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusDot } from './status-dot'
const meta = {
  title: 'Primitives/Status dot',
  component: StatusDot,
  tags: ['autodocs'],
} satisfies Meta<typeof StatusDot>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot size={7} className="animate-pulse bg-accent" />
      <StatusDot size={8} className="bg-notify" />
      <StatusDot size={6} className="bg-danger-fg" />
    </div>
  ),
}

/** The dot is decoration: the word beside it carries the meaning. */
export const WithLabels: Story = {
  render: () => (
    <ul className="flex flex-col gap-2 text-[13px] text-ink">
      <li className="flex items-center gap-2">
        <StatusDot size={7} className="bg-accent" /> Running
      </li>
      <li className="flex items-center gap-2">
        <StatusDot size={8} className="bg-notify" /> Waiting on a person
      </li>
      <li className="flex items-center gap-2">
        <StatusDot size={6} className="bg-danger-fg" /> Failed
      </li>
      <li className="flex items-center gap-2">
        <StatusDot size={6} className="bg-ink-soft/50" /> Queued
      </li>
    </ul>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {[6, 7, 8, 10, 12].map((size) => (
        <StatusDot key={size} size={size} className="bg-accent" />
      ))}
    </div>
  ),
}

/** Inside a chip, where it turns a label into a status. */
export const InAChip: Story = {
  render: () => (
    <span className="inline-flex h-7 items-center gap-2 rounded-control bg-notify/12 px-3 text-xs font-bold text-ink-strong">
      <StatusDot className="size-2 bg-notify" />
      Waiting on 2 approvals
    </span>
  ),
}
