import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResizableColumn } from './resizable-column'

const meta = {
  title: 'Components/ResizableColumn',
  component: ResizableColumn,
  tags: ['autodocs'],
  args: {
    initial: 360,
    minWidth: 240,
    minRemainder: 280,
    'aria-label': 'Resize reference panel',
    children: null,
  },
  argTypes: { children: { control: false } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A right-hand column with a drag handle on its left edge — chat on the left, a document on the right. Clamps so the sibling keeps `minRemainder` px. Give it a `storageKey` and the width survives a reload.',
      },
    },
  },
  render: (args) => (
    <div className="flex h-[26rem] overflow-hidden border-y border-line bg-canvas">
      <div className="min-w-0 flex-1 p-5 text-[13px] text-ink">
        <p className="font-bold text-ink-strong">Chat column</p>
        <p className="mt-1 text-ink-soft">Drag the grip on the panel’s left edge.</p>
      </div>
      <ResizableColumn {...args} className="border-l border-line bg-panel-solid">
        <div className="h-full overflow-auto p-5 text-[13px] text-ink">
          <p className="font-bold text-ink-strong">Reference panel</p>
          <p className="mt-1 text-ink-soft">Never narrower than {args.minWidth}px.</p>
        </div>
      </ResizableColumn>
    </div>
  ),
} satisfies Meta<typeof ResizableColumn>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Reload the story after dragging — the width is read back from localStorage. */
export const Persisted: Story = { args: { storageKey: 'storybook-resizable-column' } }

/** Starting wide. The sibling still keeps `minRemainder`, so on a narrow
 *  screen the column gives way first. */
export const StartsWide: Story = { args: { initial: 560, minRemainder: 320 } }

/** A tight minimum, for a column that only ever holds a short list. */
export const NarrowMinimum: Story = { args: { initial: 220, minWidth: 180 } }
