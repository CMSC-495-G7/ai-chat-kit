import { useMemo, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HistoryIcon, SparkleIcon } from '../../../primitives/icons'
import {
  cannedTurns,
  personas,
  promptTemplates,
  recentChats,
  suggestions,
  typeaheadPool,
} from '../../fixtures/chat'
import { PersonaPanel } from '../persona-panel'
import { RecentChatsPanel } from '../recent-chats-panel'
import type { PaletteInput } from '../../../lib/palette'
import { createCannedResponder } from '../../engine/chatEngine'
import type { SidePanel } from '../../engine/types'
import { ChatWidget, type WidgetController, type WidgetPosition } from './chat-widget'

const PROFILE = { name: 'Dana Whitfield', loginId: 'dwhitfield' }
const useProfile = () => PROFILE

const SIDE_PANELS: SidePanel[] = [
  {
    id: 'recent',
    label: 'Recent chats',
    icon: <HistoryIcon width={16} height={16} />,
    title: 'Recent chats',
    content: <RecentChatsPanel chats={recentChats} activeId="current" onSelect={() => {}} />,
  },
  {
    id: 'persona',
    label: 'Persona',
    icon: <SparkleIcon width={16} height={16} />,
    title: 'Persona selection',
    content: (
      <PersonaPanel
        personas={personas}
        personaId="guide"
        onPersonaChange={() => {}}
        templates={promptTemplates}
      />
    ),
  },
]

/**
 * Rendered straight into the page rather than through `mountWidget`'s shadow
 * root, so it picks up the toolbar's palette and mode like any other story.
 * The shadow-root path — the one a host site uses — is the "Widget on a host
 * page" recipe.
 */
function Widget({
  position = 'bottom-right',
  sidePanels = SIDE_PANELS,
  starters = [],
  palette,
}: {
  position?: WidgetPosition
  sidePanels?: SidePanel[]
  starters?: string[]
  palette?: PaletteInput
}) {
  const responder = useMemo(() => createCannedResponder(cannedTurns), [])
  const controller = useRef(null) as WidgetController
  return (
    <div className="relative h-dvh bg-canvas p-8">
      <p className="max-w-md text-[13px] text-ink-soft">
        The launcher sits in the corner. Open it, ask a question, expand the panel, or try the side
        rail’s tabs.
      </p>
      <ChatWidget
        responder={responder}
        branding={{
          appName: 'Assistant',
          modelName: 'Assistant',
          disclaimer: 'AI can make mistakes. Verify important details.',
        }}
        suggestions={suggestions}
        typeaheadPool={typeaheadPool}
        starters={starters}
        sidePanels={sidePanels}
        launcherLabel="Ask Assistant"
        useProfile={useProfile}
        initialTheme="auto"
        initialPalette={palette}
        position={position}
        zIndex={50}
        controller={controller}
      />
    </div>
  )
}

const meta = {
  title: 'Chat/Components/ChatWidget',
  component: ChatWidget,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The floating launcher plus the pop-in panel. Chat state lives here, and the panel is hidden with CSS rather than unmounted — the conversation and draft survive closing and reopening.',
      },
    },
  },
} satisfies Meta<typeof ChatWidget>

export default meta
type Story = StoryObj<typeof ChatWidget>

export const BottomRight: Story = { render: () => <Widget /> }

export const BottomLeft: Story = { render: () => <Widget position="bottom-left" /> }

/** With no side panels the rail is not drawn and the panel is chat alone. */
export const WithoutSidePanels: Story = { render: () => <Widget sidePanels={[]} /> }

/** Starters are short prompts offered in the empty panel, sized for its width. */
export const WithStarters: Story = {
  render: () => (
    <Widget starters={['What changed since Friday?', 'Which invoices are due this week?']} />
  ),
}

/**
 * A custom palette from one seed colour — the `palette` mount option. It is
 * applied to the widget's own root, so it wins over the toolbar's Palette
 * while the toolbar's Mode still flips light and dark.
 */
export const CustomPalette: Story = {
  render: () => <Widget sidePanels={[]} palette={{ brand: '#0f766e', warm: '#0f766e' }} />,
}
