import { useRef, useState, type CSSProperties } from 'react'
import { AccountMenu } from '../../../components/account-menu'
import { FacetFilters } from '../../../components/facet-filters'
import { useResizableWidth } from '../../../hooks/useResizableWidth'
import { IconButton } from '../../../primitives/icon-button'
import {
  ChatIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
} from '../../../primitives/icons'
import { Orb } from '../../../primitives/orb'
import { StatusDot } from '../../../primitives/status-dot'
import { MenuAction } from './menu-action'
import type { ChatMenuProps } from './types'

/** How many conversations the rail lists once Recent is expanded. Six fills
 *  the space without pushing the account menu below the fold, and a rail that
 *  scrolls its own history competes with the transcript for the same gesture.
 *
 *  Recent now starts folded: Filters is the section that earns the scroll
 *  area, because a facet list with counts is something you work in, while a
 *  history list is something you glance at. */
const RECENT_LIMIT = 6

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
  embedded = false,
  open,
  collapsed,
  onToggleCollapse,
  onClose,
  onNewChat,
}: ChatMenuProps) {
  const [recentOpen, setRecentOpen] = useState(false)
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
            reads as "open me" far more plainly than an orb over a chevron. */}
        <div
          className={`flex items-center gap-2.5 px-5 pt-5 pb-4 ${
            collapsed ? 'lg:justify-center lg:px-3' : ''
          }`}
        >
          {!embedded && (
            <Orb
              className={`orb block size-7 shrink-0 rounded-full ${collapsed ? 'lg:hidden' : ''}`}
              aria-hidden
            />
          )}
          <span
            className={`text-lg font-semibold tracking-tight text-ink-strong ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            {embedded ? 'Chat' : appName}
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

        <div className={`px-4 ${collapsed ? 'lg:px-3' : ''}`}>
          <button
            type="button"
            onClick={onNewChat}
            title="New chat"
            className={`flex w-full items-center gap-2.5 rounded-control bg-panel-solid px-4 py-3 text-sm font-semibold text-ink-strong shadow-sm ring-1 ring-line transition hover:shadow-md hover:ring-accent/40 ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <ChatIcon className="shrink-0 text-accent" />
            <span className={collapsed ? 'lg:hidden' : ''}>New chat</span>
          </button>
        </div>

        <nav
          className={`mt-4 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-4 pb-3 ${
            collapsed ? 'lg:px-3' : ''
          }`}
        >
          <MenuAction icon={<SearchIcon />} label="Search chat" collapsed={collapsed} />

          {/* The section that replaced Library. Everything it needs arrives as
              props — counts, selection, the lookup page — so the library
              component stays host-agnostic and `useDemoFacets` is the only
              piece that would be swapped for real endpoints. */}
          <FacetFilters
            className={collapsed ? '' : 'min-h-0 flex-1'}
            {...facets}
            railCollapsed={collapsed}
            onExpandRail={onToggleCollapse}
          />

          {/* Recent conversations — too detailed for the slim rail, so hidden
              when collapsed, and folded by default now that Filters owns the
              scroll area. A flat list, newest first: grouping by persona
              buried the thing people actually scan for (the conversation's
              title) under a heading they already know, and split six items
              into three stubby groups. */}
          <div className={`shrink-0 border-t border-line pt-1 ${collapsed ? 'lg:hidden' : ''}`}>
            <button
              type="button"
              onClick={() => setRecentOpen((v) => !v)}
              aria-expanded={recentOpen}
              className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-left transition hover:bg-panel"
            >
              {recentOpen ? (
                <ChevronDownIcon width={13} height={13} className="shrink-0 text-ink-soft" />
              ) : (
                <ChevronRightIcon width={13} height={13} className="shrink-0 text-ink-soft" />
              )}
              <span className="flex-1 text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
                Recent
              </span>
              <span className="text-[11px] text-ink-soft tabular-nums">{recentChats.length}</span>
            </button>

            <ul hidden={!recentOpen}>
              {recentChats.slice(0, RECENT_LIMIT).map(({ id, title, when }) => (
                <li key={id}>
                  <button
                    type="button"
                    title={title}
                    onClick={() => onSelectChat?.(id)}
                    className="group flex w-full items-baseline gap-2 rounded-control px-2 py-1.5 text-left transition hover:bg-panel"
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft transition group-hover:text-ink">
                      {title}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-soft/70">{when}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* One control, not two: the avatar is the entry point to both the
            account dialog and the feature toggles, which is what keeps the slim
            rail down to a single glyph here. */}
        {!embedded && (
          <div className={`border-t border-line px-4 py-3 ${collapsed ? 'lg:px-2.5' : ''}`}>
            <AccountMenu collapsed={collapsed} trigger="row" {...account} />
          </div>
        )}
      </aside>
    </>
  )
}
