import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { suggestions, typeaheadPool } from '../../fixtures/chat'
import type { ChainControls, ChainState } from '../../engine/types'
import { Composer } from './composer'

/** Chain controls the way useChat hands them out, minus the running. */
function useChain(): ChainControls {
  const [state, setState] = useState<ChainState | null>(null)
  return {
    state,
    start: () => setState({ phase: 'planning' }),
    add: () => setState((s) => s ?? { phase: 'planning' }),
    run: () => setState({ phase: 'running', total: 3 }),
    cancel: () => setState(null),
  }
}

const meta = {
  title: 'Chat/Components/Composer',
  component: Composer,
  tags: ['autodocs'],
  args: {
    docked: true,
    streaming: false,
    disabled: false,
    queueing: true,
    onSubmit: fn(),
    onStop: fn(),
    onDraftChange: fn(),
  },
  argTypes: {
    chain: { control: false },
    suggestions: { control: false },
    typeaheadPool: { control: false },
  },
  decorators: [(Story) => <div className="mx-auto max-w-3xl pt-72">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'Auto-growing textarea, expand toggle, attachments, hold-to-speak mic, send/stop. `Enter` queues while streaming; with a draft typed mid-stream the primary button becomes one Queue action with a menu naming both verbs (`Queue` / `Send now`) and their keys. Suggestions add the sparkle drop-up and suggest-as-you-type.',
      },
    },
  },
} satisfies Meta<typeof Composer>

export default meta
type Story = StoryObj<typeof meta>

export const Docked: Story = {}

/** The empty-state composer, centred under the hero. */
export const Centered: Story = {
  args: { docked: false },
  decorators: [(Story) => <div className="-mt-60">{Story()}</div>],
}

/** Send becomes Stop; type something to see Queue / Send now. */
export const Streaming: Story = { args: { streaming: true } }

/** Queueing off: while streaming the box only offers Stop, and the draft waits. */
export const StreamingWithoutQueue: Story = { args: { streaming: true, queueing: false } }

export const Disabled: Story = { args: { disabled: true } }

/** The sparkle drop-up, and suggest-as-you-type from the typeahead pool. */
export const WithSuggestions: Story = {
  args: { suggestions, typeaheadPool, typeaheadStorageKey: 'storybook-composer-typeahead' },
}

/** With chain controls the Queue toggle appears; building, Enter adds a step. */
export const WithChain: Story = {
  render: function ChainStory(args) {
    const chain = useChain()
    return (
      <div className="flex flex-col gap-2">
        <Composer {...args} chain={chain} />
        <code className="text-[12px] text-ink-soft">
          chain.state = {JSON.stringify(chain.state)}
        </code>
      </div>
    )
  },
}

/** Compact density is the widget's; flip the toolbar's Density to compare. */
export const Narrow: Story = {
  args: { suggestions },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
}
