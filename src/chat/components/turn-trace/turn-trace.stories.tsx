import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { traces } from '../../fixtures/chat'
import type { TurnTrace } from '../../engine/types'
import { TurnTraceFailure, TurnTraceHandle, TurnTracePanel } from './turn-trace'

function Trace({ trace }: { trace: TurnTrace }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex max-w-xl flex-col gap-2">
      <div className="flex justify-end">
        <TurnTraceHandle trace={trace} open={open} onToggle={() => setOpen((o) => !o)} />
      </div>
      <TurnTracePanel trace={trace} open={open} />
    </div>
  )
}

const meta = {
  title: 'Chat/Components/TurnTrace',
  component: TurnTracePanel,
  tags: ['autodocs'],
  args: { trace: traces.ok, open: true },
  parameters: {
    docs: {
      description: {
        component:
          'What a turn did and how long it took. The handle is the `2.4s` at the right of the action row; the panel is the timeline, columns headed Start / Step / Took. `status` is the outcome a single error flag can’t express: `recovered` answered anyway, `stopped` was the reader’s own doing, only `failed` has no answer.',
      },
    },
  },
} satisfies Meta<typeof TurnTracePanel>

export default meta
type Story = StoryObj<typeof meta>

export const Ok: Story = { render: () => <Trace trace={traces.ok} /> }

/** A fault on the timeline, but the answer arrived. */
export const Recovered: Story = { render: () => <Trace trace={traces.recovered} /> }

export const Stopped: Story = { render: () => <Trace trace={traces.stopped} /> }

/** The failed turn's whole body: frayed rail, verdict, Retry. */
export const Failure: Story = {
  render: () => (
    <div className="max-w-xl">
      <TurnTraceFailure
        reason="The connection to the model was lost."
        trace={traces.failed}
        onRetry={fn()}
      />
    </div>
  ),
}

/** Died before it started — no timeline is drawn. */
export const FailureBeforeStart: Story = {
  render: () => (
    <div className="max-w-xl">
      <TurnTraceFailure reason="The assistant is unavailable right now." onRetry={fn()} />
    </div>
  ),
}
