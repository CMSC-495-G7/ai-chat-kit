import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChatIcon,
  HomeIcon,
  IngestionIcon,
  InsightsIcon,
  SlidersIcon,
  TasksIcon,
  WorkflowIcon,
} from '../../primitives/icons'
import { MenuPanelLabel, MenuPanelRow, MenuPanelSearch } from './panel-parts'
import { SideMenu } from './side-menu'
import { InSideMenu, SideMenuSlotProvider } from './slot'
import type { MenuSection, SideMenuPanel } from './types'

const SECTIONS: MenuSection[] = [
  {
    id: 'top',
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: <HomeIcon /> },
      { id: 'chat', label: 'Chat', href: '/chat', icon: <ChatIcon /> },
      {
        id: 'projects',
        label: 'Projects',
        shortLabel: 'Work',
        href: '/projects',
        icon: <WorkflowIcon />,
        children: [
          { id: 'all-projects', label: 'All projects', href: '/projects' },
          { id: 'archived', label: 'Archived', href: '/projects/archived' },
        ],
      },
      { id: 'tasks', label: 'Tasks', href: '/tasks', icon: <TasksIcon />, badge: 2 },
    ],
  },
  {
    id: 'more',
    label: 'More',
    items: [
      { id: 'insights', label: 'Insights', href: '/insights', icon: <InsightsIcon /> },
      { id: 'ingestion', label: 'Ingestion', href: '/ingestion', icon: <IngestionIcon /> },
    ],
  },
]

const projects: SideMenuPanel = {
  action: { label: 'New project', onSelect: () => {} },
  content: (
    <div className="flex flex-col gap-0.5">
      <MenuPanelSearch label="Jump to a project" />
      <MenuPanelLabel>Views</MenuPanelLabel>
      <MenuPanelRow current dot="bg-ink-strong" name="All projects" count={20} />
      <MenuPanelRow dot="bg-notify" name="Needs a person" count={6} />
      <MenuPanelRow dot="bg-accent" name="In progress" count={10} />
      <MenuPanelLabel>Recently viewed</MenuPanelLabel>
      <MenuPanelRow dot="bg-notify" name="Quarterly review" sub="Waiting on Kofi A." />
      <MenuPanelRow dot="bg-notify" name="Vendor onboarding" sub="Waiting on Dana W." />
    </div>
  ),
  flyout: (
    <>
      <MenuPanelLabel>Recently viewed</MenuPanelLabel>
      <MenuPanelRow dot="bg-notify" name="Quarterly review" count="1 day" />
      <MenuPanelRow dot="bg-notify" name="Vendor onboarding" count="3h 40m" />
    </>
  ),
}

const meta = {
  title: 'Components/Side menu',
  component: SideMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A rail of the apps, always there, and a panel for the one you are in. Pressing your own app’s icon folds its panel; resting on the icon of a folded panel opens a short version. The panel’s edge is a handle: drag it, use the arrow keys, or double-click to reset. `matchDestination`, `parentOf` and `flattenMenu` read the same data.',
      },
    },
  },
  render: (args) => (
    <div className="flex h-[620px]">
      <SideMenu {...args} />
    </div>
  ),
  args: {
    sections: SECTIONS,
    rail: ['home', 'chat', 'projects', 'tasks'],
    activeId: 'all-projects',
    panels: { projects },
    appsHeading: 'Acme',
    places: [{ label: 'Projects › Quarterly review', href: '/projects', icon: <WorkflowIcon /> }],
    footLinks: [{ id: 'settings', label: 'Settings', icon: <SlidersIcon />, onSelect: () => {} }],
  },
} satisfies Meta<typeof SideMenu>
export default meta
type Story = StoryObj<typeof meta>

/** The rail, and the panel of the app you are in. Drag the panel's edge to size it. */
export const Default: Story = {}

/** Folded: the rail alone. Rest on the Projects icon for the short version. */
export const PanelFolded: Story = { args: { defaultPanelOpen: false } }

/** An app with no panel of its own: the rail is the whole menu. */
export const NoPanel: Story = { args: { activeId: 'home' } }

/**
 * A page adds to the panel with `InSideMenu` when what it holds depends on the
 * page's own state. The section keeps that state.
 */
export const WithPageSection: Story = {
  args: { activeId: 'chat', panels: { chat: { title: 'Chat' } } },
  render: function Menu(args) {
    return (
      <SideMenuSlotProvider>
        <div className="flex h-[620px]">
          <SideMenu {...args} />
          <PageSection />
        </div>
      </SideMenuSlotProvider>
    )
  },
}

function PageSection() {
  return (
    <InSideMenu>
      <section aria-label="This page" className="flex flex-col">
        <MenuPanelLabel>Recent chats</MenuPanelLabel>
        <MenuPanelRow name="Positive pay exceptions" sub="2 days ago" />
        <MenuPanelRow name="Mortgage rate lock timing" sub="3 days ago" />
      </section>
    </InSideMenu>
  )
}
