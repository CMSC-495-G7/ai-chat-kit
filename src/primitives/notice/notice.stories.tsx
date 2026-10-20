import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { BulbIcon } from '../icons'
import { Button } from '../button'
import { Notice } from './notice'

const meta = {
  title: 'Primitives/Notice',
  component: Notice,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    children: 'References are still loading',
    label: 'Loading',
  },
  argTypes: {
    children: { control: 'text' },
    label: { control: 'text' },
    icon: { control: false },
    action: { control: false },
  },
  decorators: [(Story) => <div className="max-w-[42rem]">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'A one-line status band for a message flow — a conversation, a side panel, the top of a list. The whole strip takes the tone, a glyph leads, and an optional `label` names the state in words, so tone is never the only signal. One inline `action` at most; anything needing a list, details or a primary button is an `Alert`. `InlineTip` is a `Notice`.',
      },
    },
  },
} satisfies Meta<typeof Notice>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="@container">
      <div className="grid gap-2.5 @lg:grid-cols-2">
        <Notice tone="info" label="Info">
          Sync runs every night at 2:00 AM
        </Notice>
        <Notice tone="success" label="Success">
          All 42 members have signed in
        </Notice>
        <Notice tone="warning" label="Warning">
          Certificate expires in 12 days
        </Notice>
        <Notice tone="error" label="Error">
          Sign-in with Okta is failing
        </Notice>
      </div>
    </div>
  ),
}

/** The action sits at the end of the line, in the tone's colour. */
export const WithAction: Story = {
  args: {
    tone: 'error',
    children: 'The answer stopped before it finished',
    label: 'Interrupted',
    action: { label: 'Retry', onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent('Interrupted')
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
    await expect(args.action!.onClick).toHaveBeenCalledOnce()
  },
}

export const Dismissible: Story = {
  render: function DismissibleStory() {
    const [visible, setVisible] = useState(true)
    return visible ? (
      <Notice
        tone="success"
        label="Saved"
        onDismiss={() => setVisible(false)}
        dismissLabel="Dismiss saved notice"
      >
        Retention changed to 18 months
      </Notice>
    ) : (
      <Button size="sm" onClick={() => setVisible(true)}>
        Show the notice again
      </Button>
    )
  },
}

/** Long copy wraps; the label and action follow it rather than squeezing it. */
export const Wrapping: Story = {
  decorators: [(Story) => <div className="w-72 max-w-full">{Story()}</div>],
  args: {
    tone: 'warning',
    children: 'Two of the cited sources are more than a year old',
    label: 'Check',
    action: { label: 'Show sources', onClick: fn() },
  },
}

/** A tip: normal-weight copy, its own glyph, no tag. This is what `InlineTip` renders. */
export const Tip: Story = {
  args: {
    tone: 'info',
    label: undefined,
    icon: <BulbIcon width={16} height={16} />,
    onDismiss: fn(),
    role: 'note',
    children: (
      <span className="font-normal text-ink">
        Select any numbered citation to open its original source.
      </span>
    ),
  },
}

/** In a conversation: notices sit between turns at the message column's width. */
export const InConversation: Story = {
  decorators: [(Story) => <div className="w-[36rem] max-w-full">{Story()}</div>],
  render: () => (
    <div className="flex flex-col gap-3 text-[13.5px]">
      <div className="ml-auto max-w-[80%] rounded-surface bg-chip px-3.5 py-2.5 text-ink-strong">
        What changed in our cash position since Friday?
      </div>
      <Notice tone="info" label="3 of 5">
        Reading treasury reports
      </Notice>
      <p className="m-0 leading-relaxed text-ink">
        Operating cash rose 4.2% to $18.6M, mainly from two early customer payments…
      </p>
      <Notice tone="warning" label="Check" action={{ label: 'Show sources', onClick: fn() }}>
        One source is from last quarter
      </Notice>
      <Notice tone="error" label="Interrupted" action={{ label: 'Retry', onClick: fn() }}>
        The answer stopped before it finished
      </Notice>
    </div>
  ),
}
