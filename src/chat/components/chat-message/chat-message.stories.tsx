import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { messages, scope } from '../../fixtures/chat'
import { CitationsProvider } from '../../engine/citations'
import { ChatMessage } from './chat-message'

const onCite = fn()

const meta = {
  title: 'Chat/Components/ChatMessage',
  component: ChatMessage,
  tags: ['autodocs'],
  args: {
    message: messages.answer,
    onFollowup: fn(),
    onRetry: fn(),
    busy: false,
    showActions: true,
  },
  argTypes: { message: { control: 'object' } },
  decorators: [
    // Citation chips open the host's reference frame through context; here
    // they land in the Actions panel instead.
    (Story) => (
      <CitationsProvider value={onCite}>
        <div className="mx-auto max-w-3xl">{Story()}</div>
      </CitationsProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'One turn. Composes the thinking block, tool chips, markdown body, source strip, trace handle and action row. Every state below is a different `Message` — the component has no state of its own worth mocking.',
      },
    },
  },
} satisfies Meta<typeof ChatMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Question: Story = { args: { message: messages.question } }

/** Reasoning, a tool call, citations, a table, follow-ups and the trace handle. */
export const Answer: Story = {}

/** Reasoning still running; nothing in the body yet. */
export const Thinking: Story = { args: { message: messages.thinking, onFollowup: undefined } }

/** Mid-stream: the caret is on, follow-ups and actions wait for `done`. */
export const Streaming: Story = { args: { message: messages.streaming, busy: true } }

/** A tool failed but the answer arrived — the trace says “recovered”, nothing to act on. */
export const Recovered: Story = { args: { message: messages.recovered } }

/** The reader pressed Stop; the partial answer stays. */
export const Stopped: Story = { args: { message: messages.stopped, onFollowup: undefined } }

/** No answer at all: frayed rail, verdict and Retry. */
export const Failed: Story = { args: { message: messages.failed, onFollowup: undefined } }

export const FailedWhileBusy: Story = {
  name: 'Failed (retry held while busy)',
  args: { message: messages.failed, onFollowup: undefined, busy: true },
}

/** A question recorded under a filter scope. Pass `scopeChips` to compare against now. */
export const AskedOverScope: Story = {
  args: { message: messages.scopedQuestion, scopeChips: scope.chips },
}

/** The scope has changed since — the strip says so and offers Restore. */
export const AskedOverChanged: Story = {
  args: {
    message: messages.scopedQuestion,
    scopeChips: scope.chips.slice(0, 2),
    onRestoreScope: fn(),
  },
}

/** The one-time “citations open the source” tip. Dismissal persists in localStorage. */
export const WithSourceTip: Story = { args: { showSourceTip: true } }

export const WithoutActions: Story = { args: { showActions: false, onFollowup: undefined } }
