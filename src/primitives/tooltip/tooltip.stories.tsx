import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { IconButton } from '../icon-button'
import { HistoryIcon, TrashIcon } from '../icons'
import { Tooltip } from './tooltip'

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    content: 'Show the run log',
    placement: 'top',
    delay: 400,
    children: (
      <IconButton aria-label="Run log">
        <HistoryIcon width={16} height={16} />
      </IconButton>
    ),
  },
  argTypes: { children: { control: false }, content: { control: 'text' } },
  decorators: [(Story) => <div className="grid place-items-center py-12">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'Short supplementary text, portalled out of clipping ancestors. The trigger keeps its own accessible name; the tooltip is wired as `aria-describedby`. Pointer hover waits `delay`; keyboard focus opens at once.',
      },
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Bottom: Story = { args: { placement: 'bottom' } }

export const Disabled: Story = { args: { disabled: true } }

/** Clipped by `overflow: hidden` yet still fully visible — it lives in a portal. */
export const InsideClippingContainer: Story = {
  render: (args) => (
    <div className="flex h-12 w-64 items-center justify-end overflow-hidden rounded-control border border-line px-2">
      <Tooltip {...args} content="Delete this tenant and every workspace in it">
        <Button variant="danger" size="sm" icon={<TrashIcon width={13} height={13} />}>
          Delete
        </Button>
      </Tooltip>
    </div>
  ),
}
