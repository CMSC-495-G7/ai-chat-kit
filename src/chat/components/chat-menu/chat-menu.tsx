import { useRef, type CSSProperties } from 'react'
import { AccountMenu } from '../../../components/account-menu'
import { useResizableWidth } from '../../../hooks/useResizableWidth'
import { IconButton } from '../../../primitives/icon-button'
import { ChevronLeftIcon, MenuIcon, XIcon } from '../../../primitives/icons'
import { Orb } from '../../../primitives/orb'
import { StatusDot } from '../../../primitives/status-dot'
import { ChatMenuBody } from './chat-menu-body'
import type { ChatMenuProps } from './types'

/** The narrowest and widest the menu can be dragged. The floor keeps a facet
 *  row's label and count on one line; the ceiling leaves the transcript room. */
const MIN_WIDTH = 240
const MAX_WIDTH = 560

export function ChatMenu({
  widthStorageKey,
  appName,
  recentChats,
  facets,
  account,
  onSelectChat,
  open,
  collapsed,
  onToggleCollapse,
  onClose,
  onNewChat,
}: ChatMenuProps) {
  const asideRef = useRef<HTMLElement>(null)
  // Desktop only, and only while expanded: the mobile slide-over and the slim
  // rail keep their fixed widths.
  const resize = useResizableWidth({
    initial: 288,
    min: MIN_WIDTH,
    max: MAX_WIDTH,
    storageKey: widthStorageKey,
  })

  return (
    <>
      {/* Mobile scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-scrim/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        ref={asideRef}
        aria-label="Chat menu"
        style={{ '--chat-menu-w': `${resize.width}px` } as CSSProperties}
        // No width transition mid-drag: easing toward a moving target makes the
        // edge trail the pointer.
        className={`glass fixed inset-y-0 left-0 z-40 flex w-72 flex-col rounded-r-surface duration-300 lg:relative lg:z-auto lg:translate-x-0 lg:rounded-surface ${
          resize.dragging ? 'transition-transform' : 'transition-[transform,width]'
        } ${collapsed ? 'lg:w-16' : 'lg:w-(--chat-menu-w)'} ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* The right edge is the handle: drag it, or focus it and use the arrow
            keys. It sits in the gap between the menu and the conversation. */}
        {!collapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize the chat menu"
            aria-valuenow={Math.round(resize.width)}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={MAX_WIDTH}
            tabIndex={0}
            onPointerDown={(event) =>
              resize.onPointerDown(event, asideRef.current?.getBoundingClientRect().left ?? 0)
            }
            onKeyDown={resize.onKeyDown}
            className="group absolute inset-y-0 -right-3.5 z-10 hidden w-3 cursor-col-resize touch-none items-center justify-center lg:flex"
          >
            <StatusDot
              aria-hidden
              className={`h-10 w-1 rounded-full transition-colors ${
                resize.dragging
                  ? 'bg-accent'
                  : 'bg-ink-soft/30 group-hover:bg-accent/70 group-focus-visible:bg-accent'
              }`}
            />
          </div>
        )}
        {/* The collapsed rail carries nothing but the hamburger: branding and
            the app name belong to the expanded sidebar, and a lone menu button
            reads as "open me" far more plainly than the mark over a chevron. */}
        <div
          className={`flex items-center gap-2.5 px-5 pt-5 pb-4 ${
            collapsed ? 'lg:justify-center lg:px-3' : ''
          }`}
        >
          <Orb
            className={`orb block size-7 shrink-0 ${collapsed ? 'lg:hidden' : ''}`}
            aria-hidden
          />
          <span
            className={`text-lg font-semibold tracking-tight text-ink-strong ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            {appName}
          </span>
          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden rounded-control p-1.5 text-ink-soft transition hover:bg-panel hover:text-ink-strong lg:block ${
              collapsed ? '' : 'ml-auto'
            }`}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </button>
          {/* Mobile close — touch-only, so it takes the 44px variant. */}
          <IconButton
            size="lg"
            shape="rounded"
            onClick={onClose}
            className="ml-auto lg:hidden"
            aria-label="Close sidebar"
          >
            <XIcon />
          </IconButton>
        </div>

        <ChatMenuBody
          recentChats={recentChats}
          facets={facets}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />

        {/* One control, not two: the avatar is the entry point to both the
            account dialog and the feature toggles, which is what keeps the slim
            rail down to a single glyph here. */}
        <div className={`border-t border-line px-4 py-3 ${collapsed ? 'lg:px-2.5' : ''}`}>
          <AccountMenu collapsed={collapsed} trigger="row" {...account} />
        </div>
      </aside>
    </>
  )
}
