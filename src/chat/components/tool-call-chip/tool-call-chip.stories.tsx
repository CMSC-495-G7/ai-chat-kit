import type { Meta, StoryObj } from '@storybook/react-vite'
import { tools } from '../../fixtures/chat'
import { ToolCallChip } from './tool-call-chip'

const meta = {
  title: 'Chat/Components/ToolCallChip',
  component: ToolCallChip,
  tags: ['autodocs'],
  args: { tool: tools.done },
  parameters: {
    docs: {
      description: {
        component:
          'One tool call as a status chip — pulsing while running, a check when done, red with the reason when it fails. Finished calls expand to their input and output JSON.',
      },
    },
  },
} satisfies Meta<typeof ToolCallChip>

export default meta
type Story = StoryObj<typeof meta>

export const Running: Story = { args: { tool: tools.running } }

/** Click to expand the input/output JSON. */
export const Completed: Story = {}

export const Failed: Story = { args: { tool: tools.failed } }

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <ToolCallChip tool={tools.running} />
      <ToolCallChip tool={tools.done} />
      <ToolCallChip tool={tools.failed} />
    </div>
  ),
}
