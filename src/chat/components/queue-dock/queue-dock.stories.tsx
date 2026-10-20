import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { queue as initialQueue } from '../../fixtures/chat'
import type { ChainControls, ChainState, QueueMove, QueuedMessage } from '../../engine/types'
import { QueueDock } from './queue-dock'
import type { QueueDockProps } from './types'

function move(items: QueuedMessage[], id: number, to: QueueMove): QueuedMessage[] {
  const from = items.findIndex((i) => i.id === id)
  if (from < 0) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  const index =
    to === 'front'
      ? 0
      : to === 'up'
        ? Math.max(0, from - 1)
        : to === 'down'
          ? Math.min(next.length, from + 1)
          : to
  next.splice(index, 0, item)
  return next
}

/** Owns the queue the way useChat does, so every control in the dock works. */
function Host({ chainPhase, ...props }: Partial<QueueDockProps> & { chainPhase?: ChainState }) {
  const [items, setItems] = useState(props.items ?? initialQueue)
  const [held, setHeld] = useState(props.held ?? false)
  const [chainState, setChainState] = useState<ChainState | null>(chainPhase ?? null)
  const chain: ChainControls | undefined = chainPhase
    ? {
        state: chainState,
        start: () => setChainState({ phase: 'planning' }),
        add: (text) => setItems((i) => [...i, { id: Date.now(), text }]),
        run: () => setChainState({ phase: 'running', total: items.length }),
        cancel: () => setChainState(null),
      }
    : undefined
  return (
    <QueueDock
      busy
      {...props}
      items={items}
      held={held}
      chain={chain}
      onSendNow={(id) => setItems((i) => i.filter((x) => x.id !== id))}
      onEdit={(id, text) =>
        setItems((i) =>
          text ? i.map((x) => (x.id === id ? { ...x, text } : x)) : i.filter((x) => x.id !== id),
        )
      }
      onMove={(id, to) => setItems((i) => move(i, id, to))}
      onRemove={(id) => setItems((i) => i.filter((x) => x.id !== id))}
      onHold={() => setHeld(true)}
      onResume={() => setHeld(false)}
      onClear={() => setItems([])}
    />
  )
}

const meta = {
  title: 'Chat/Components/QueueDock',
  component: QueueDock,
  tags: ['autodocs'],
  args: {
    items: initialQueue,
    held: false,
    busy: true,
    onSendNow: fn(),
    onEdit: fn(),
    onMove: fn(),
    onRemove: fn(),
    onHold: fn(),
    onResume: fn(),
    onClear: fn(),
  },
  decorators: [(Story) => <div className="mx-auto max-w-3xl pt-8">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'The send queue, parked on the composer’s lip rather than in the transcript — so a streaming answer can’t push a queued message down the page. Next-up gets the full row (send now, edit, drag to reorder, menu); the rest collapse to a line. Nothing about the dock is persisted.',
      },
    },
  },
} satisfies Meta<typeof QueueDock>

export default meta
type Story = StoryObj<typeof meta>

/** Fully interactive: reorder, edit, send now, pause, clear. */
export const Queued: Story = { render: () => <Host /> }

/** Paused: nothing dispatches until Resume — the one filled way out. */
export const Held: Story = { render: () => <Host held /> }

export const Single: Story = { render: () => <Host items={initialQueue.slice(0, 1)} /> }

/** A ghost row shows where the draft being typed will land. */
export const WithDraft: Story = { render: () => <Host draft="Also: what's the reserve buffer?" /> }

/** Building a chain: the dock shows even empty, and offers Run in place of Pause. */
export const PlanningChain: Story = {
  render: () => <Host items={[]} busy={false} chainPhase={{ phase: 'planning' }} />,
}

export const RunningChain: Story = {
  render: () => <Host chainPhase={{ phase: 'running', total: 4 }} />,
}
