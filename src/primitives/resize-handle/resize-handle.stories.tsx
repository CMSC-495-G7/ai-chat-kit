import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ResizeHandle } from './resize-handle'

const meta = {
  title: 'Primitives/ResizeHandle',
  component: ResizeHandle,
  tags: ['autodocs'],
  args: { onPointerDown: fn(), active: false, 'aria-label': 'Resize panel' },
  parameters: {
    docs: {
      description: {
        component:
          'The grip alone. Presentational — drag state lives in `useResizablePanel`; see `ResizableColumn` for both wired together.',
      },
    },
  },
  render: (args) => (
    <div className="relative h-48 w-72 rounded-control border border-line bg-panel-solid">
      <ResizeHandle {...args} />
    </div>
  ),
} satisfies Meta<typeof ResizeHandle>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {}

/** Held highlighted while a drag is in progress. */
export const Dragging: Story = { args: { active: true } }

/** Where it sits: on the edge between two columns, belonging to the one it resizes. */
export const BetweenTwoColumns: Story = {
  render: (args) => (
    <div className="flex h-48 w-[32rem] overflow-hidden rounded-control border border-line bg-panel-solid">
      <div className="flex-1 p-4 text-[13px] text-ink-soft">The conversation</div>
      <div className="relative w-56 border-l border-line p-4 text-[13px] text-ink-soft">
        <ResizeHandle {...args} />
        The reference panel
      </div>
    </div>
  ),
}
