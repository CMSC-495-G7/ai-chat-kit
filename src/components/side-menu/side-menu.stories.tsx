import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChatIcon,
  HomeIcon,
  IngestionIcon,
  InsightsIcon,
  TasksIcon,
  WorkflowIcon,
} from '../../primitives/icons'
import { SideMenu } from './side-menu'
import type { MenuSection } from './types'

const TOP: MenuSection = {
  id: 'top',
  items: [
    { id: 'page-1', label: 'Page 1', href: '/page-1', icon: <HomeIcon /> },
    { id: 'page-2', label: 'Page 2', href: '/page-2', icon: <TasksIcon />, badge: 2 },
  ],
}

const SECTIONS: MenuSection[] = [
  TOP,
  {
    id: 'group-1',
    label: 'Group 1',
    items: [
      { id: 'chat', label: 'Chat', href: '/chat', icon: <ChatIcon /> },
      {
        id: 'page-3',
        label: 'Page 3',
        href: '/page-3',
        icon: <WorkflowIcon />,
        children: [
          { id: 'page-3a', label: 'Page 3a', href: '/page-3/a' },
          { id: 'page-3b', label: 'Page 3b', href: '/page-3/b' },
        ],
      },
    ],
  },
  {
    id: 'group-2',
    label: 'Group 2',
    items: [
      {
        id: 'page-4',
        label: 'Page 4',
        href: '/page-4',
        icon: <InsightsIcon />,
        children: [
          { id: 'page-4a', label: 'Page 4a', href: '/page-4/a' },
          { id: 'page-4b', label: 'Page 4b', href: '/page-4/b' },
        ],
      },
      {
        id: 'page-5',
        label: 'Page 5',
        href: '/page-5',
        icon: <IngestionIcon />,
        children: [
          { id: 'page-5a', label: 'Page 5a', href: '/page-5/a' },
          { id: 'page-5b', label: 'Page 5b', href: '/page-5/b' },
        ],
      },
    ],
  },
]

const meta = {
  title: 'Components/Side menu',
  component: SideMenu,
  tags: ['autodocs'],
  render: function Menu(args) {
    const [open, setOpen] = useState(args.openIds)
    return (
      <div className="flex h-[620px]">
        <SideMenu {...args} openIds={open} onOpenIdsChange={setOpen} />
      </div>
    )
  },
  args: {
    sections: SECTIONS,
    activeId: 'page-1',
    openIds: [],
    onOpenIdsChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'Grouped destinations, each able to open into its sub-sections, folding to a 64px icon rail where sub-sections open in a flyout. Open state and mode are controlled; `matchDestination`, `parentOf` and `flattenMenu` read the same data.',
      },
    },
  },
} satisfies Meta<typeof SideMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {}
export const SectionOpen: Story = { args: { openIds: ['page-3'], activeId: 'page-3a' } }
export const Rail: Story = { args: { mode: 'rail' } }
/** Only the destinations the host passes are drawn; empty groups are left out. */
export const Minimal: Story = {
  args: {
    sections: [
      {
        ...TOP,
        items: [
          ...TOP.items.map(({ badge: _, ...item }) => item),
          { id: 'chat', label: 'Chat', href: '/chat', icon: <ChatIcon /> },
        ],
      },
    ],
    activeId: 'chat',
  },
}
