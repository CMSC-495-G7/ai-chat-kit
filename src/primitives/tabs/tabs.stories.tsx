import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ChatIcon, HomeIcon, SearchIcon, SlidersIcon, UserIcon } from '../icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const panel = 'rounded-control border border-line bg-code p-4 text-[13px] text-ink'

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { defaultValue: 'elements', orientation: 'horizontal', activationMode: 'automatic' },
  argTypes: { children: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'The shadcn compound API, styled with the brand tokens. `line` (the default) underlines the selected tab with a rounded brand bar that grows from the centre, and the label steps up to extra-bold without nudging its neighbours; `segmented` raises the selected tab out of a tinted track, for switching views of one thing. Triggers take an `icon` and a `count`. Arrow keys move through enabled triggers; `activationMode="manual"` waits for Enter/Space.',
      },
    },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="elements">Card elements</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="elements">
        <div className={panel}>Content for the selected card-elements tab.</div>
      </TabsContent>
      <TabsContent value="details">
        <div className={panel}>Details stay mounted only while this tab is selected.</div>
      </TabsContent>
      <TabsContent value="activity">
        <div className={panel}>Recent activity for this record.</div>
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
// Typed against the component, not `meta`: `children` is required and every
// story renders its own, so it never belongs in args.
type Story = StoryObj<typeof Tabs>

export const Line: Story = {}

export const ManualActivation: Story = { args: { activationMode: 'manual' } }

/** Page sections: icons and counts, with a disabled tab. The count pill takes the selected colour. */
export const WithIconsAndCounts: Story = {
  render: () => (
    <Tabs defaultValue="activity">
      <TabsList aria-label="Tenant sections">
        <TabsTrigger value="overview" icon={<HomeIcon width={15} height={15} />}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity" icon={<ChatIcon width={15} height={15} />} count={128}>
          Activity
        </TabsTrigger>
        <TabsTrigger value="members" icon={<UserIcon width={15} height={15} />} count={42}>
          Members
        </TabsTrigger>
        <TabsTrigger value="settings" icon={<SlidersIcon width={15} height={15} />}>
          Settings
        </TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className={panel}>Health, seats in use and renewal at a glance.</div>
      </TabsContent>
      <TabsContent value="activity">
        <div className={panel}>128 questions this month, 9 flagged for review.</div>
      </TabsContent>
      <TabsContent value="members">
        <div className={panel}>42 people, 3 invitations waiting.</div>
      </TabsContent>
      <TabsContent value="settings">
        <div className={panel}>Access, sign-in and retention for this tenant.</div>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: /Members/ }))
    await expect(canvas.getByRole('tab', { name: /Members/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('42 people')
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus()
  },
}

/** Views of one thing — a chart's range, a code sample's language. */
export const Segmented: Story = {
  render: () => (
    <Tabs defaultValue="d30">
      <TabsList variant="segmented" aria-label="Chart range">
        <TabsTrigger value="d7">7 days</TabsTrigger>
        <TabsTrigger value="d30">30 days</TabsTrigger>
        <TabsTrigger value="d90">90 days</TabsTrigger>
        <TabsTrigger value="ytd">Year to date</TabsTrigger>
      </TabsList>
      {['d7', 'd30', 'd90', 'ytd'].map((range) => (
        <TabsContent key={range} value={range} className="pt-1 text-[13px] text-ink-soft">
          Questions asked over the selected range.
        </TabsContent>
      ))}
    </Tabs>
  ),
}

const settings = ['General', 'Access and roles', 'Single sign-on', 'Data retention']

/** A settings nav. The bar moves to the leading edge. */
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="Access and roles" orientation="vertical" className="flex gap-6">
      <TabsList aria-label="Settings sections" className="w-52">
        {settings.map((name) => (
          <TabsTrigger key={name} value={name} count={name === 'Access and roles' ? 3 : undefined}>
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {settings.map((name) => (
        <TabsContent key={name} value={name}>
          <div className={panel}>{name} settings for this tenant.</div>
        </TabsContent>
      ))}
    </Tabs>
  ),
}

export const VerticalSegmented: Story = {
  render: () => (
    <Tabs defaultValue="General" orientation="vertical" className="flex items-start gap-6">
      <TabsList variant="segmented" aria-label="Settings sections" className="w-52">
        {settings.map((name) => (
          <TabsTrigger key={name} value={name}>
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {settings.map((name) => (
        <TabsContent key={name} value={name}>
          <div className={panel}>{name} settings for this tenant.</div>
        </TabsContent>
      ))}
    </Tabs>
  ),
}

/**
 * `unstyled` + `allowDeselect` + `controls={false}`: an icon rail whose panels
 * render elsewhere. Selecting the active icon again clears it.
 */
export const IconRail: Story = {
  render: function IconRailStory() {
    const [tab, setTab] = useState<string | null>('account')
    const trigger = (id: string) =>
      `grid size-8 place-items-center rounded-control transition ${
        tab === id ? 'bg-chip text-chip-fg' : 'text-ink-soft hover:bg-tint/8'
      }`
    return (
      <div className="flex items-start gap-4">
        <Tabs
          value={tab}
          onValueChange={setTab}
          allowDeselect
          orientation="vertical"
          activationMode="manual"
        >
          <TabsList variant="unstyled" className="flex flex-col gap-1">
            <TabsTrigger
              value="account"
              controls={false}
              tabIndex={tab == null ? 0 : undefined}
              aria-label="Account"
              className={trigger('account')}
            >
              <UserIcon width={16} height={16} />
            </TabsTrigger>
            <TabsTrigger
              value="search"
              controls={false}
              aria-label="Search"
              className={trigger('search')}
            >
              <SearchIcon width={16} height={16} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-[13px] text-ink-soft">
          Selected: <code>{String(tab)}</code>
        </p>
      </div>
    )
  },
}
