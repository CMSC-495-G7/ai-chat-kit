import { useState } from 'react'
import { ChatIcon, CircleCheckIcon, PinIcon, TriangleAlertIcon } from '../icons'
import { Button } from '../button'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Card } from './card'
import type { CardMove } from './types'
import { SortableColumnExample } from './sortable-column.example'

const orderChanged = fn()
const moved = fn()

const meta = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  render: function CardPlayground(args) {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    if (!args.draggable) return <Card {...args} />
    return (
      <Card
        {...args}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onMove={(delta: CardMove) => {
          setPosition((previous) => ({ x: previous.x + delta.x, y: previous.y + delta.y }))
          moved(delta)
          args.onMove?.(delta)
        }}
      />
    )
  },
  argTypes: { children: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'A content surface drawn open: no rules between its parts. A brand-coloured `eyebrow` names the kind of card, the title leads at 17px, an optional `description` and `icon` sit with it, and spacing does the separating. `footer` pins to the bottom edge. `href` makes the whole card one native link, with header controls still clickable above it. Dragging is opt-in; the parent owns position or order. Pointer gestures expose start/end callbacks so sorting can commit on drop and cancel on Escape.',
      },
    },
  },
  args: {
    title: 'Recently visited',
    eyebrow: 'Your history',
    description: 'Pages you opened this week',
    children: (
      <ul className="divide-y divide-line text-[13px] text-brand-fg">
        <li className="py-3">Role: Technology Analyst</li>
        <li className="py-3">User Management: User</li>
        <li className="py-3">Tenant Setup</li>
      </ul>
    ),
  },
  // `parameters.width` widens a story past the single-card column.
  decorators: [
    (Story, { parameters }) => (
      <div className={`${parameters.width ?? 'w-88'} max-w-full`}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof Card>
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Move card' }),
    ).not.toBeInTheDocument()
  },
}
export const WithActions: Story = {
  args: { actions: [{ id: 'refresh', label: 'Refresh', onSelect: fn() }] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'More card actions' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Refresh' }))
    await expect(args.actions![0].onSelect).toHaveBeenCalledOnce()
    await expect(canvas.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument()
  },
}
export const Draggable: Story = {
  args: { actions: [{ id: 'refresh', label: 'Refresh', onSelect: fn() }] },
  render: function Movable(args) {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    return (
      <div className="min-h-96 p-4">
        <Card
          {...args}
          draggable
          onMove={(delta) =>
            setPosition((p) => ({
              x: Math.max(-16, Math.min(48, p.x + delta.x)),
              y: Math.max(-16, Math.min(80, p.y + delta.y)),
            }))
          }
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        />
        <output className="sr-only">
          {position.x}, {position.y}
        </output>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: 'Move card' }).focus()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    await expect(canvas.getByRole('status')).toHaveTextContent('10, 10')
  },
}

/** Parent-owned ordering; the Card primitive does not own a list. */
export const SortableColumn: Story = {
  render: () => <SortableColumnExample onOrderChange={orderChanged} />,
  parameters: {
    docs: {
      description: {
        story:
          'Drag a handle past another card, then release to reorder. Escape cancels. Arrow Up/Down moves one position; the action disclosure also offers Move up/down. Stable keys preserve each card’s state.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('button', { name: 'Move Recently visited' })
    handle.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getAllByRole('heading').map((el) => el.textContent)).toEqual([
      'Saved reports',
      'Recently visited',
      'Team tasks',
    ])
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect(canvas.getAllByRole('heading')[0]).toHaveTextContent('Recently visited')
  },
}
export const SortableVariableHeight: Story = {
  render: () => <SortableColumnExample variableHeight onOrderChange={orderChanged} />,
  parameters: {
    docs: {
      description: {
        story:
          'The same ordering contract with unequal card heights. Drop targets use measured card centers, never a hardcoded row height.',
      },
    },
  },
}

const heights = [34, 46, 40, 58, 52, 66, 61, 74, 70, 84, 79, 92]

/** Every part: icon, eyebrow, description, a header control, actions and a footer. */
export const Anatomy: Story = {
  args: {
    title: 'Questions asked',
    eyebrow: 'Last 30 days',
    description: 'All members of Crestview Bank',
    icon: <ChatIcon width={17} height={17} />,
    headerAction: (
      <Button size="sm" variant="ghost">
        Export
      </Button>
    ),
    actions: [
      { id: 'refresh', label: 'Refresh', onSelect: fn() },
      { id: 'pin', label: 'Pin to overview', onSelect: fn() },
    ],
    footer: (
      <>
        <span>Updated 2 minutes ago</span>
        <a href="#activity" className="ml-auto font-extrabold text-brand-fg hover:underline">
          See all activity
        </a>
      </>
    ),
    children: (
      <div>
        <div className="flex items-baseline gap-2.5">
          <b className="text-[32px] font-extrabold tabular-nums text-ink-strong">1,284</b>
          <span className="text-[12px] font-bold text-success-fg">+12% vs August</span>
        </div>
        <div aria-hidden="true" className="mt-3.5 flex h-16 items-end gap-1.5">
          {heights.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-t-[3px] ${i === heights.length - 1 ? 'bg-brand-fg' : 'bg-chip'}`}
            />
          ))}
        </div>
      </div>
    ),
  },
}

/** A semantic warning uses the caution tokens while the card stays neutral. */
export const WarningIcon: Story = {
  args: {
    title: 'Source needs attention',
    eyebrow: 'Source health',
    description: 'Some documents could not be indexed',
    icon: <TriangleAlertIcon width={17} height={17} />,
    iconTone: 'warning',
    children: (
      <p className="m-0 text-sm text-ink-soft">
        Three documents need review. Search still works for the remaining documents.
      </p>
    ),
  },
}

/**
 * The whole card is one link: the title is a native anchor stretched over the
 * card, so Cmd/Ctrl-click opens a new tab. It lifts on hover.
 */
export const AsLink: Story = {
  args: {
    title: 'Data retention policy',
    eyebrow: 'Guide',
    description: undefined,
    href: '#retention',
    icon: <PinIcon width={16} height={16} />,
    footer: <span>Updated Sep 12 · 4 min read</span>,
    children: (
      <p className="m-0 text-[13px] text-ink-soft">
        How long questions, answers and uploaded files are kept, and who can export them before they
        are deleted.
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Data retention policy' })
    await expect(link).toHaveAttribute('href', '#retention')
  },
}

/** An empty state inside a card: say what will appear, and how to get there. */
export const EmptyState: Story = {
  args: {
    title: 'Flagged answers',
    eyebrow: 'Review',
    description: 'Marked as wrong by members',
    children: (
      <div className="flex flex-col items-center gap-1.5 py-2 text-center">
        <span className="mb-1.5 grid size-12 place-items-center rounded-surface bg-chip text-chip-fg">
          <CircleCheckIcon width={22} height={22} />
        </span>
        <strong className="text-[14px] text-ink-strong">Nothing flagged this week</strong>
        <span className="max-w-[30ch] text-[13px] text-ink-soft">
          Answers that members mark as wrong land here for review.
        </span>
        <Button size="sm" className="mt-2">
          Open review queue
        </Button>
      </div>
    ),
  },
}

/** A settings form: buttons in the footer, the save state beside them. */
export const WithFooterActions: Story = {
  parameters: { width: 'w-[36rem]' },
  args: {
    title: 'Single sign-on',
    eyebrow: 'Security',
    description: 'How members of Crestview Bank sign in',
    footer: (
      <>
        <span>Last saved Sep 28, 2026</span>
        <span className="ml-auto flex gap-2">
          <Button size="sm">Cancel</Button>
          <Button size="sm" variant="primary">
            Save changes
          </Button>
        </span>
      </>
    ),
    children: (
      <p className="m-0 text-[13px] text-ink-soft">
        Members without an Okta account lose access at their next sign-in.
      </p>
    ),
  },
}

/** Cards in a grid stretch to the row; footers stay on the bottom edge. */
export const Grid: Story = {
  parameters: { width: 'w-[60rem]' },
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5">
      <Card eyebrow="Plan" title="Seats in use" footer={<span>88 seats free</span>}>
        <b className="text-[32px] font-extrabold tabular-nums text-ink-strong">412</b>
        <span className="ml-2 text-ink-soft">of 500</span>
      </Card>
      <Card eyebrow="Quality" title="Flag rate" description="Answers marked as wrong">
        <b className="text-[32px] font-extrabold tabular-nums text-ink-strong">0.7%</b>
      </Card>
      <Card
        eyebrow="Guide"
        title="Onboarding checklist"
        href="#onboarding"
        footer={<span>6 steps · 10 min</span>}
      >
        <p className="m-0 text-[13px] text-ink-soft">Everything a new tenant admin sets up.</p>
      </Card>
    </div>
  ),
}
