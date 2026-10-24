import { useState } from 'react'
import { SideMenu, SideMenuSlotProvider, type MenuSection } from '../../../components/side-menu'
import { SlideOver } from '../../../components/slide-over'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { IconButton } from '../../../primitives/icon-button'
import { ChatIcon, HomeIcon, MenuIcon, SlidersIcon, TasksIcon } from '../../../primitives/icons'
import { BrandingProvider } from '../../engine/branding'
import { demoBranding } from '../../fixtures/config'
import { FeatureTogglesModal } from '../settings-dialogs/feature-toggles-modal'
import { UserSettingsModal } from '../settings-dialogs/user-settings-modal'
import { DemoFeaturesProvider, useDemoFeatureState } from '../shared/demoFeatures'
import { Chat } from './full-chat-app'

const SECTIONS: MenuSection[] = [
  {
    id: 'apps',
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: <HomeIcon /> },
      { id: 'chat', label: 'Chat', href: '/chat', icon: <ChatIcon /> },
      { id: 'tasks', label: 'Tasks', href: '/tasks', icon: <TasksIcon />, badge: 2 },
    ],
  },
]

/**
 * The chat docked beside the platform's side menu: the rail of apps, with the
 * chat's own panel (New chat, filters, history) in the panel beside it. The
 * page owns that panel's content, so it reaches the menu through `InSideMenu`.
 * On a phone the rail is not docked: a button opens it over the page.
 */
export function ChatInSideMenu() {
  const demo = useDemoFeatureState()
  const [dialog, setDialog] = useState<'user' | 'features' | null>(null)
  const narrow = useMediaQuery('(max-width: 767px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menu = (
    <SideMenu
      sections={SECTIONS}
      rail={['home', 'chat', 'tasks']}
      activeId="chat"
      panels={{ chat: { title: 'Chat' } }}
      footLinks={[
        {
          id: 'settings',
          label: 'Settings',
          icon: <SlidersIcon />,
          onSelect: () => setDialog('user'),
        },
      ]}
    />
  )
  return (
    <BrandingProvider value={demoBranding}>
      <DemoFeaturesProvider value={demo}>
        <SideMenuSlotProvider>
          <div className="flex h-dvh">
            {!narrow && menu}
            <SlideOver
              open={narrow && drawerOpen}
              onClose={() => setDrawerOpen(false)}
              label="Menu"
            >
              {menu}
            </SlideOver>
            <div className="relative min-w-0 flex-1">
              {narrow && (
                <IconButton
                  size="lg"
                  shape="rounded"
                  onClick={() => setDrawerOpen((open) => !open)}
                  className="absolute top-4 left-4 z-10"
                  aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={drawerOpen}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Chat
                embedded
                onOpenUserSettings={() => setDialog('user')}
                onOpenFeatureToggles={() => setDialog('features')}
              />
            </div>
          </div>
        </SideMenuSlotProvider>
        <UserSettingsModal open={dialog === 'user'} onClose={() => setDialog(null)} />
        <FeatureTogglesModal open={dialog === 'features'} onClose={() => setDialog(null)} />
      </DemoFeaturesProvider>
    </BrandingProvider>
  )
}
