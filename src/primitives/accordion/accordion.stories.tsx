import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { MailIcon } from '../icons'
import { Alert } from '../alert'
import { Avatar } from '../avatar'
import { Button } from '../button'
import { Card } from '../card'
import { ChoiceCard } from '../choice-card'
import { Field, FieldDescription, FieldLabel } from '../field'
import { Pill } from '../pill'
import { Select } from '../select'
import { Switch } from '../switch'
import { TextInput } from '../text-input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import type { AccordionStepStatus } from './types'

const SECTIONS = [
  {
    value: 'access',
    title: 'Access and roles',
    summary: 'Owners, analysts',
    heading: 'Who can open this workspace',
    body: 'Members join as Analysts unless an owner assigns another role. Owners invite people, change roles and remove access; analysts read and export reports but cannot change tenant settings.',
  },
  {
    value: 'retention',
    title: 'Data retention',
    summary: '18 months',
    heading: 'How long conversations are kept',
    body: 'Transcripts and their cited sources are kept for 18 months, then deleted. Reports someone already downloaded are not recalled.',
  },
  {
    value: 'sso',
    title: 'Single sign-on',
    summary: 'Okta, required',
    heading: 'Signing in through your identity provider',
    body: 'Members sign in through Okta and password sign-in is off. Removing someone from the Okta group ends their access at the next sign-in.',
  },
]

const INBOXES = [
  {
    value: 'general',
    title: 'General inbox',
    address: 'general@alderfinch.com',
    pill: ['Paused', 'neutral'],
  },
  {
    value: 'loans',
    title: 'Loan requests',
    address: 'loans@alderfinch.com',
    pill: ['Syncing', 'green'],
  },
  {
    value: 'disputes',
    title: 'Disputes',
    address: 'disputes@alderfinch.com',
    pill: ['Sync failed', 'red'],
  },
] as const

/** A bold lead-in, then the detail — what every panel in these stories says. */
function Body({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <>
      <p className="mb-1.5 text-[14px] font-extrabold text-ink-strong">{heading}</p>
      <p className="max-w-[60ch]">{children}</p>
    </>
  )
}

function Sections({ disabledFrom }: { disabledFrom?: number } = {}) {
  return SECTIONS.map((s, i) => (
    <AccordionItem
      key={s.value}
      value={s.value}
      disabled={disabledFrom !== undefined && i >= disabledFrom}
    >
      <AccordionTrigger summary={s.summary}>{s.title}</AccordionTrigger>
      <AccordionContent>
        <Body heading={s.heading}>{s.body}</Body>
      </AccordionContent>
    </AccordionItem>
  ))
}

const meta = {
  title: 'Primitives/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    type: 'single',
    defaultValue: 'access',
    collapsible: true,
    disabled: false,
    rail: false,
    headingLevel: 3,
    onValueChange: fn(),
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    children: { control: false },
  },
  // The column width the settings stories are drawn at; the wizard opts out.
  decorators: [
    (Story, { parameters }) =>
      parameters.wide ? Story() : <div className="max-w-[34rem]">{Story()}</div>,
  ],
  render: (args) => (
    // Remount when the shape changes — `defaultValue` is read once.
    <Accordion key={args.type} {...args}>
      <Sections />
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Stacked sections that show or hide their own content, drawn as a **parting list**: closed items are one joined list, each showing its current value (`summary`); opening one lifts it out as a raised card and the list parts around it. `rail` adds the chat’s reasoning rail — a node per row and a line down the open item — and turns `step` markers into its nodes, which is what a wizard wants. Same compound shape as `Tabs`: `Accordion` › `AccordionItem` › `AccordionTrigger` + `AccordionContent`. Triggers sit in headings; ↑ ↓ Home End move between them; closed panels are `inert`.',
      },
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
// Typed against the component: its props are a single/multiple union.
type Story = StoryObj<typeof Accordion>

/** A settings list: every row's value on the right, one section open at a time. */
export const Basic: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const access = canvas.getByRole('button', { name: /Access and roles/ })
    const retention = canvas.getByRole('button', { name: /Data retention/ })
    await expect(access).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(retention)
    await expect(retention).toHaveAttribute('aria-expanded', 'true')
    await expect(access).toHaveAttribute('aria-expanded', 'false')
    retention.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('button', { name: /Single sign-on/ })).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(access).toHaveFocus()
  },
}

/** The same list with the rail — compare against Basic. */
export const Rail: Story = { args: { rail: true } }

/** Items stay readable but cannot open; arrow keys skip them. */
export const Disabled: Story = {
  args: { defaultValue: null },
  render: (args) => (
    <Accordion {...args}>
      <Sections disabledFrom={1} />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: /Data retention/ })).toBeDisabled()
    canvas.getByRole('button', { name: /Access and roles/ }).focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('button', { name: /Access and roles/ })).toHaveFocus()
  },
}

/** The host owns what is open; several panels may be. */
export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [open, setOpen] = useState<string[]>(['access'])
    const all = SECTIONS.map((s) => s.value)
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setOpen(all)} disabled={open.length === all.length}>
            Expand all
          </Button>
          <Button size="sm" onClick={() => setOpen([])} disabled={open.length === 0}>
            Collapse all
          </Button>
          <span className="text-[12px] text-ink-soft" aria-live="polite">
            {open.length} of {all.length} open
          </span>
        </div>
        <Accordion rail={args.rail} type="multiple" value={open} onValueChange={setOpen}>
          <Sections />
        </Accordion>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Expand all' }))
    for (const s of SECTIONS)
      await expect(canvas.getByRole('button', { name: new RegExp(s.title) })).toHaveAttribute(
        'aria-expanded',
        'true',
      )
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse all' }))
    await expect(canvas.getByText('0 of 3 open')).toBeInTheDocument()
  },
}

/** A leading `icon`, a `meta` status beside the title, the address as `summary`. */
export const Customized: Story = {
  args: { defaultValue: 'loans' },
  render: (args) => (
    <Accordion {...args}>
      {INBOXES.map((inbox) => (
        <AccordionItem key={inbox.value} value={inbox.value}>
          <AccordionTrigger
            icon={<MailIcon />}
            meta={
              <Pill size="sm" tone={inbox.pill[1]}>
                {inbox.pill[0]}
              </Pill>
            }
            summary={inbox.address}
          >
            {inbox.title}
          </AccordionTrigger>
          <AccordionContent>
            <Body heading="Connected mailbox">
              Messages sent to {inbox.address} become conversations the assistant can cite. Syncing
              runs every five minutes.
            </Body>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

/** `collapsible={false}`: one section always stays open. */
export const AlwaysOneOpen: Story = { args: { collapsible: false } }

export const Multiple: Story = { args: { type: 'multiple', defaultValue: ['access', 'sso'] } }

/** Closed panels keep their state — type in the field, close, reopen. */
export const StatefulContent: Story = {
  args: { defaultValue: 'note' },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="note">
        <AccordionTrigger summary="Draft saved">Handover note</AccordionTrigger>
        <AccordionContent>
          <Field>
            <FieldLabel htmlFor="handover">Note for the next analyst</FieldLabel>
            <TextInput id="handover" defaultValue="Waiting on the guarantor's revised statement." />
          </Field>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// --- Wizard -----------------------------------------------------------------

const ROLES = [
  { id: 'analyst', title: 'Analyst', desc: 'Asks questions, reads and exports reports.' },
  { id: 'reviewer', title: 'Reviewer', desc: 'Everything an analyst can, plus approving answers.' },
  { id: 'owner', title: 'Owner', desc: 'Full control, including billing and members.' },
]

const STEPS = ['details', 'members', 'inboxes', 'review'] as const

function StepFooter({ onBack, children }: { onBack?: () => void; children: ReactNode }) {
  return (
    <div className="mt-5 flex items-center gap-2">
      {onBack && <Button onClick={onBack}>Back</Button>}
      <div className="ml-auto flex gap-2">{children}</div>
    </div>
  )
}

/**
 * A setup wizard: steps are items, `step` / `status` draw the markers, and
 * the host decides which steps are reachable. Completed steps can be
 * reopened; the ones ahead are disabled until reached.
 */
function SetupWizard({ rail }: { rail?: boolean }) {
  const [reached, setReached] = useState(1)
  const [open, setOpen] = useState<string | null>('members')
  const [role, setRole] = useState('analyst')
  const [sso, setSso] = useState(true)
  const [people, setPeople] = useState(['Priya Raman', 'Marcus Webb', 'Nia Coleman'])
  const [connected, setConnected] = useState<Record<string, boolean>>({
    general: false,
    loans: true,
    disputes: true,
  })
  const roleName = ROLES.find((r) => r.id === role)!.title
  const inviteText = people.length ? `${people.length} people` : 'No one yet'
  const inboxText = `${Object.values(connected).filter(Boolean).length} of 3 connected`
  const go = (index: number) => {
    setReached((r) => Math.max(r, index))
    setOpen(STEPS[index] ?? null)
  }
  const status = (index: number): AccordionStepStatus =>
    index < reached ? 'complete' : index === reached ? 'current' : 'upcoming'
  const summary = (index: number, text: string) => (index <= reached ? text : 'Not started')
  const initials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')

  return (
    <div className="grid max-w-5xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-strong">
            Set up a workspace
          </h1>
          <p className="text-sm text-ink-soft">
            Four steps. You can change any of this later in Settings.
          </p>
        </header>
        <Accordion rail={rail} value={open} onValueChange={setOpen} headingLevel={2}>
          <AccordionItem value="details">
            <AccordionTrigger
              step={1}
              status={status(0)}
              summary={summary(0, 'Alder & Finch Operations · US East')}
            >
              Workspace details
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="wz-name">Workspace name</FieldLabel>
                  <TextInput
                    id="wz-name"
                    defaultValue="Alder & Finch Operations"
                    validationState="valid"
                    validationMessage="Name is available"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="wz-region">Data region</FieldLabel>
                  <Select
                    id="wz-region"
                    defaultValue="us-east"
                    options={[
                      { value: 'us-east', label: 'US East (Virginia)' },
                      { value: 'us-west', label: 'US West (Oregon)' },
                      { value: 'eu', label: 'EU (Frankfurt)' },
                    ]}
                  />
                  <FieldDescription>Conversations and sources are stored here.</FieldDescription>
                </Field>
              </div>
              <StepFooter>
                <Button variant="primary" onClick={() => go(1)}>
                  Continue
                </Button>
              </StepFooter>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="members" disabled={1 > reached}>
            <AccordionTrigger
              step={2}
              status={status(1)}
              summary={summary(
                1,
                `${roleName} by default · ${inviteText} · ${sso ? 'SSO required' : 'SSO optional'}`,
              )}
            >
              Members and roles
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5">
              <fieldset className="grid gap-2.5 sm:grid-cols-3">
                <legend className="mb-2 text-[12.5px] font-bold text-ink-strong">
                  Default role for new members
                </legend>
                {ROLES.map((r) => (
                  <ChoiceCard
                    key={r.id}
                    type="radio"
                    name="wz-role"
                    value={r.id}
                    checked={role === r.id}
                    onChange={() => setRole(r.id)}
                    label={r.title}
                    description={r.desc}
                  />
                ))}
              </fieldset>
              <Field>
                <FieldLabel htmlFor="wz-invite">Invite people</FieldLabel>
                <TextInput
                  id="wz-invite"
                  placeholder="Add by name or email"
                  prefix={
                    <span className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {people.map((name) => (
                        <Pill
                          key={name}
                          tone="neutral"
                          avatar={<Avatar variant="text" text={initials(name)} size="xs" />}
                          onClose={() => setPeople((list) => list.filter((n) => n !== name))}
                          closeLabel={`Remove ${name}`}
                        >
                          {name}
                        </Pill>
                      ))}
                    </span>
                  }
                />
                <FieldDescription>Invites go out when you create the workspace.</FieldDescription>
              </Field>
              <Switch
                label="Require single sign-on"
                description="Members sign in through Okta; password sign-in is turned off."
                checked={sso}
                onChange={setSso}
              />
              <StepFooter onBack={() => setOpen('details')}>
                <Button variant="primary" onClick={() => go(2)}>
                  Continue
                </Button>
              </StepFooter>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="inboxes" disabled={2 > reached}>
            <AccordionTrigger step={3} status={status(2)} summary={summary(2, inboxText)}>
              Connect inboxes
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col divide-y divide-line">
                {INBOXES.map((inbox) => {
                  const on = connected[inbox.value]
                  return (
                    <li key={inbox.value} className="flex items-center gap-3 py-3 first:pt-0">
                      <MailIcon width={18} height={18} className="shrink-0 text-ink-soft" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[13.5px] font-bold text-ink-strong">
                          {inbox.title}
                        </span>
                        <span className="text-xs">{inbox.address}</span>
                      </span>
                      <Pill size="sm" tone={on ? 'green' : 'neutral'}>
                        {on ? 'Syncing' : 'Not connected'}
                      </Pill>
                      <Switch
                        label={`Connect ${inbox.title}`}
                        hideLabel
                        checked={on}
                        onChange={(next) => setConnected((c) => ({ ...c, [inbox.value]: next }))}
                      />
                    </li>
                  )
                })}
              </ul>
              <StepFooter onBack={() => setOpen('members')}>
                <Button onClick={() => go(3)}>Skip for now</Button>
                <Button variant="primary" onClick={() => go(3)}>
                  Continue
                </Button>
              </StepFooter>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="review" disabled={3 > reached}>
            <AccordionTrigger
              step={4}
              status={status(3)}
              summary={summary(3, 'Check everything, then create')}
            >
              Review and create
            </AccordionTrigger>
            <AccordionContent>
              <dl className="grid grid-cols-[9rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13.5px]">
                {[
                  ['Workspace', 'Alder & Finch Operations'],
                  ['Region', 'US East (Virginia)'],
                  ['Default role', roleName],
                  ['Invites', inviteText],
                  ['Sign-in', sso ? 'Okta, required' : 'Password or Okta'],
                  ['Inboxes', inboxText],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt>{k}</dt>
                    <dd className="font-semibold text-ink-strong">{v}</dd>
                  </div>
                ))}
              </dl>
              <StepFooter onBack={() => setOpen('inboxes')}>
                <Button variant="primary">Create workspace</Button>
              </StepFooter>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <aside className="flex flex-col gap-4 lg:pt-[4.75rem]" aria-label="Workspace summary">
        <Card title="Alder & Finch Operations">
          <dl className="flex flex-col gap-2.5 text-[13px]">
            {[
              ['Region', 'US East'],
              ['Default role', roleName],
              ['Sign-in', sso ? 'Okta, required' : 'Password or Okta'],
              ['Inboxes', inboxText],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="font-bold text-ink-strong">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">
            {Math.min(reached, 4)} of 4 steps done
          </p>
        </Card>
        <Alert tone="info" title="Nothing is created yet">
          Close this page and your answers are kept as a draft for 7 days.
        </Alert>
      </aside>
    </div>
  )
}

/**
 * The wizard, with the rail on: step markers become the rail's nodes and the
 * open step's form hangs off its line. Toggle `rail` in Controls to compare.
 */
export const Wizard: Story = {
  args: { rail: true },
  parameters: { wide: true },
  render: (args) => <SetupWizard key={String(args.rail)} rail={args.rail} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const members = canvas.getByRole('button', { name: /Step 2, current: Members and roles/ })
    await expect(members).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('button', { name: /Connect inboxes/ })).toBeDisabled()
    // Continue completes the step and opens the next one.
    await userEvent.click(canvas.getAllByRole('button', { name: 'Continue' })[1])
    await expect(canvas.getByRole('button', { name: /Step 2, done: Members/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(
      canvas.getByRole('button', { name: /Step 3, current: Connect inboxes/ }),
    ).toHaveAttribute('aria-expanded', 'true')
  },
}
