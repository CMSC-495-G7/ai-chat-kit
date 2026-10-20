import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from '../button'
import { Alert } from './alert'

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    title: 'References are still loading',
    children: 'You can continue reading while the source documents are prepared.',
  },
  argTypes: {
    children: { control: 'text' },
    title: { control: 'text' },
    icon: { control: false },
    details: { control: false },
    action: { control: false },
    secondaryAction: { control: false },
    bordered: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="max-w-[42rem]">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'A status message on a quiet panel. The tone lives in the tile around the glyph and in the action — a button in the tone\'s own colour — so the one thing to do next is the one thing in colour. Every tone pairs colour with a distinct glyph and a visible title. Lists and native `<details>` carry richer messages; `layout="inline"` makes a one-line page banner. For a one-line status band inside a message flow, use `Notice`.',
      },
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <Alert tone="success" title="Workspace settings saved">
        Your changes are available to everyone on the team.
      </Alert>
      <Alert tone="warning" title="Review before publishing">
        Two answers contain sources that are more than a year old.
      </Alert>
      <Alert tone="error" title="The import could not be completed">
        Correct the source data and try again.
      </Alert>
      <Alert tone="info" title="References are still loading">
        You can continue reading while the source documents are prepared.
      </Alert>
    </div>
  ),
}

/** Each tone's action takes its colour: Retry in red, Review in amber. */
export const Actions: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <Alert
        tone="warning"
        title="Two answers cite sources older than a year"
        action={{ label: 'Review sources', onClick: fn() }}
        secondaryAction={{ label: 'Publish anyway', onClick: fn() }}
      >
        Readers see the source date, but may not check it.
      </Alert>
      <Alert
        tone="info"
        title="No tenants match these filters"
        action={{ label: 'Clear filters', onClick: fn() }}
      >
        Try a wider date range.
      </Alert>
      <Alert
        tone="success"
        title="Invitations sent"
        action={{ label: 'View members', onClick: fn() }}
      >
        42 people can sign in from today.
      </Alert>
    </div>
  ),
}

/** `layout="inline"`: a page-level banner on one line, wrapping when it runs out of room. */
export const InlineBanner: Story = {
  decorators: [(Story) => <div className="w-[56rem] max-w-full">{Story()}</div>],
  args: {
    tone: 'error',
    layout: 'inline',
    title: 'Invoice INV-2291 is 14 days overdue.',
    children: 'Seats lock on Oct 14, 2026 unless it is paid.',
    action: { label: 'Pay invoice', onClick: fn() },
    secondaryAction: { label: 'Contact billing', onClick: fn() },
  },
}

export const WithItems: Story = {
  args: {
    tone: 'error',
    title: 'Three fields need attention',
    children: undefined,
    secondaryAction: { label: 'Go to the first field', onClick: fn() },
    items: [
      'Workspace name is required.',
      'API endpoint must use HTTPS.',
      'At least one knowledge source must be selected.',
    ],
  },
}

export const ActionAndDetails: Story = {
  args: {
    tone: 'error',
    title: 'The API rejected this request',
    children: 'The service returned a validation error. Technical details are available below.',
    action: { label: 'Try again', onClick: fn() },
    detailsLabel: 'Show API response',
    details: (
      <pre className="overflow-x-auto rounded-control border border-line bg-code-block p-3 font-mono text-[11.5px] leading-relaxed text-ink">
        {JSON.stringify({ status: 422, code: 'invalid_source', requestId: 'req_7f91a2' }, null, 2)}
      </pre>
    ),
  },
}

export const NoIcon: Story = {
  args: { icon: false, title: 'A plain notice with no glyph' },
}

export const Dismissible: Story = {
  render: function DismissibleStory(args) {
    const [visible, setVisible] = useState(true)
    return visible ? (
      <Alert
        {...args}
        title="Citation shortcuts are available"
        onDismiss={() => setVisible(false)}
        dismissLabel="Dismiss citation shortcut notice"
      >
        Select any numbered citation to open its original source.
      </Alert>
    ) : (
      <Button size="sm" onClick={() => setVisible(true)}>
        Reset dismissed alert
      </Button>
    )
  },
}

export const Retry: Story = {
  args: {
    tone: 'error',
    title: 'The source could not be added',
    children: 'Check that the URL is public, then try again.',
    action: { label: 'Try again', onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent('The source could not be added')
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(args.action!.onClick).toHaveBeenCalledOnce()
  },
}
