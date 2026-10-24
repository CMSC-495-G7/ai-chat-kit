import { useState } from 'react'
import { FacetFilters } from '../../../components/facet-filters'
import { ChatIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon } from '../../../primitives/icons'
import { MenuAction } from './menu-action'
import type { ChatMenuProps } from './types'

/** How many conversations the list shows once Recent is expanded. Six fills
 *  the space without pushing what is under it below the fold, and a list that
 *  scrolls its own history competes with the transcript for the same gesture.
 *
 *  Recent starts folded: Filters is the section that earns the scroll area,
 *  because a facet list with counts is something you work in, while a history
 *  list is something you glance at. */
const RECENT_LIMIT = 6

export type ChatMenuBodyProps = Pick<
  ChatMenuProps,
  'recentChats' | 'facets' | 'onSelectChat' | 'onNewChat'
> & {
  /** Desktop-only slim icon-rail state, for the standalone menu. */
  collapsed?: boolean
  onToggleCollapse?: () => void
  /**
   * In the platform's side panel, which already pads its contents: no side
   * padding of the body's own.
   */
  inset?: boolean
}

/**
 * What the chat menu holds, apart from the shell around it: New chat, search,
 * the filters, and recent conversations. The standalone `ChatMenu` frames it in
 * its own sidebar; the platform shell draws it in the side menu's panel, so
 * there is one list of what a chat's menu does and two places it can sit.
 */
export function ChatMenuBody({
  recentChats,
  facets,
  onSelectChat,
  onNewChat,
  collapsed = false,
  onToggleCollapse,
  inset = false,
}: ChatMenuBodyProps) {
  const [recentOpen, setRecentOpen] = useState(false)
  const side = inset ? '' : `px-4 ${collapsed ? 'lg:px-3' : ''}`

  return (
    <>
      <div className={side}>
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

      <nav className={`mt-4 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden pb-3 ${side}`}>
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
    </>
  )
}
