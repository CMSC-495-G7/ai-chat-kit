import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { scope } from '../../fixtures/chat'
import { AskedOverStrip } from './asked-over-strip'

const meta = {
  title: 'Chat/Components/AskedOverStrip',
  component: AskedOverStrip,
  tags: ['autodocs'],
  args: { scope, density: 'comfortable' },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'What a question was asked over, recorded on the question. A snapshot, never a view: it draws only the `scope` it was given and uses `current` purely to decide “changed since”. Pass `[]` when nothing is set now; omit it when the host does not track scope.',
      },
    },
  },
} satisfies Meta<typeof AskedOverStrip>

export default meta
type Story = StoryObj<typeof meta>

/** The host does not track scope — no comparison is made. */
export const Snapshot: Story = {}

export const Unchanged: Story = { args: { current: scope.chips } }

/** Filters have moved on since: the strip says so and offers Restore. */
export const ChangedSince: Story = { args: { current: scope.chips.slice(0, 2), onRestore: fn() } }

/** Everything was cleared since the question was asked. */
export const ClearedSince: Story = { args: { current: [], onRestore: fn() } }

export const Compact: Story = { args: { density: 'compact', current: scope.chips } }
