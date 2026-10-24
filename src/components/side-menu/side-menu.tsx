import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useResizableWidth } from '../../hooks/useResizableWidth'
import { AppsIcon, PanelCollapseIcon } from '../../primitives/icons'
import { Link, type NavigateHandler } from '../../primitives/link'
import { MenuPanelLabel, MenuPanelRow, MenuPanelSearch } from './panel-parts'
import { useSideMenuSlots } from './slot-context'
import type { MenuDestination, SideMenuAction, SideMenuPlace, SideMenuProps } from './types'

/** The panel's narrowest and widest. The floor keeps a row's name and count on one line. */
const MIN_WIDTH = 200
const MAX_WIDTH = 420
const DEFAULT_WIDTH = 260

const holdsActive = (item: MenuDestination, activeId?: string) =>
  item.id === activeId || (item.children?.some((child) => child.id === activeId) ?? false)

const railLink =
  'relative flex w-13 flex-col items-center gap-[3px] rounded-control pt-[7px] pb-1.5 text-[10.5px] font-bold transition'
const railOn = 'bg-chip text-chip-fg'
const railOff = 'text-ink-soft hover:bg-tint/5 hover:text-ink-strong'
const quiet =
  'grid size-8 shrink-0 place-items-center rounded-control text-ink-soft transition hover:bg-tint/5 hover:text-ink-strong'

/**
 * The platform's side menu: a rail of the apps, and beside it a panel for the
 * one you are in.
 *
 * The rail is always there. Pressing the icon of the app you are in folds its
 * panel away and brings it back; pressing another goes there. With the panel
 * folded, resting on the icon opens a card with the short version. The grid at
 * the top opens every destination, which is how the ones without a place in the
 * rail are reached. The panel's edge is a handle: drag it, or focus it and use
 * the arrow keys.
 *
 * What a panel holds is the host's, and `MenuPanelRow` and its siblings keep
 * the panels of different apps alike. A page whose panel depends on the page's
 * own state adds to it with `InSideMenu`.
 */
export function SideMenu({
  sections,
  rail,
  activeId,
  panels = {},
  appsHeading,
  places = [],
  footLinks = [],
  panelOpen,
  defaultPanelOpen = true,
  onPanelOpenChange,
  widthStorageKey,
  onNavigate,
  label = 'Apps',
  className = '',
}: SideMenuProps) {
  const slots = useSideMenuSlots()
  const items = sections.flatMap((section) => section.items)
  const railItems = rail.flatMap((id) => items.find((item) => item.id === id) ?? [])
  const activeApp = items.find((item) => holdsActive(item, activeId))
  const panel = activeApp ? panels[activeApp.id] : undefined

  const [kept, setKept] = useState(defaultPanelOpen)
  const open = panelOpen ?? kept
  const setOpen = (next: boolean) => {
    setKept(next)
    onPanelOpenChange?.(next)
  }
  const [view, setView] = useState<'section' | 'apps'>('section')
  const [query, setQuery] = useState('')
  const [hover, setHover] = useState<{ id: string; top: number } | null>(null)
  const asideRef = useRef<HTMLElement>(null)
  const resize = useResizableWidth({
    initial: DEFAULT_WIDTH,
    min: MIN_WIDTH,
    max: MAX_WIDTH,
    storageKey: widthStorageKey,
  })

  // Arriving at an app brings its panel, and leaves All apps behind.
  const arrivedAt = useRef(activeApp?.id)
  useEffect(() => {
    if (arrivedAt.current === activeApp?.id) return
    arrivedAt.current = activeApp?.id
    setView('section')
    setQuery('')
    if (activeApp && panels[activeApp.id]) {
      setKept(true)
      onPanelOpenChange?.(true)
    }
  }, [activeApp, panels, onPanelOpenChange])

  const inApps = view === 'apps'
  const showPanel = open && (inApps || panel !== undefined)
  const title = inApps ? 'All apps' : (panel?.title ?? activeApp?.label ?? '')

  const pressApp = (item: MenuDestination, event: MouseEvent) => {
    // Your own app is a toggle for its panel. Any other is a link.
    if (item.id !== activeApp?.id || !panels[item.id]) return
    event.preventDefault()
    if (inApps) {
      setView('section')
      setOpen(true)
    } else setOpen(!open)
  }
  const pressGrid = () => {
    if (inApps && open) {
      setView('section')
      setQuery('')
      return
    }
    setView('apps')
    setOpen(true)
  }

  const flyout = panel?.flyout
  const flyoutOpen = hover !== null && hover.id === activeApp?.id && !!flyout && !showPanel

  return (
    <div className={`flex shrink-0 self-stretch ${className}`}>
      <nav
        aria-label={label}
        onMouseLeave={() => setHover(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHover(null)
        }}
        className="relative z-20 flex w-17 shrink-0 flex-col items-center gap-1.5 border-r border-line bg-panel-solid px-2 py-3"
      >
        <button
          type="button"
          onClick={pressGrid}
          onMouseEnter={() => setHover(null)}
          aria-label={inApps && open ? 'Close all apps' : 'All apps'}
          aria-pressed={inApps && open}
          className={`grid size-10 place-items-center rounded-control border transition ${
            inApps && open
              ? 'border-accent bg-accent text-on-accent'
              : 'border-line bg-panel-solid text-ink-strong hover:border-ink-soft/40 hover:bg-tint/5'
          }`}
        >
          <AppsIcon />
        </button>
        <span aria-hidden className="my-1.5 h-px w-7 bg-line" />
        {railItems.map((item) => {
          const current = item.id === activeApp?.id && !inApps
          const name = item.badge ? `${item.label}, ${item.badge} waiting` : item.label
          const toFlyout = (event: { currentTarget: HTMLElement }) => {
            if (panels[item.id]?.flyout)
              setHover({ id: item.id, top: event.currentTarget.offsetTop })
          }
          return (
            <Link
              key={item.id}
              variant="plain"
              href={item.href}
              aria-label={name}
              aria-current={item.id === activeApp?.id ? 'page' : undefined}
              onNavigate={onNavigate}
              onClick={(event) => pressApp(item, event)}
              onMouseEnter={toFlyout}
              onFocus={toFlyout}
              className={`${railLink} ${current ? railOn : railOff}`}
            >
              <span aria-hidden className="grid size-5 place-items-center [&>svg]:size-5">
                {item.icon}
              </span>
              <span aria-hidden>{item.shortLabel ?? item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  aria-hidden
                  className="absolute top-0.5 right-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-notify px-1 text-[10px] leading-none font-bold text-on-notify ring-2 ring-panel-solid"
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
        {footLinks.length > 0 && (
          <div className="mt-auto flex flex-col items-center gap-1.5">
            {footLinks.map((link) => {
              const face = (
                <>
                  <span aria-hidden className="grid size-5 place-items-center [&>svg]:size-5">
                    {link.icon}
                  </span>
                  {link.label}
                </>
              )
              return link.href ? (
                <Link
                  key={link.id}
                  variant="plain"
                  href={link.href}
                  onNavigate={onNavigate}
                  onClick={link.onSelect}
                  className={`${railLink} ${railOff}`}
                >
                  {face}
                </Link>
              ) : (
                <button
                  key={link.id}
                  type="button"
                  onClick={link.onSelect}
                  className={`${railLink} ${railOff}`}
                >
                  {face}
                </button>
              )
            })}
          </div>
        )}
        {flyoutOpen && activeApp && (
          <div
            role="group"
            aria-label={title}
            style={{ top: hover.top }}
            className="absolute left-15.5 z-30 flex w-68 flex-col gap-px rounded-surface border border-line bg-panel-solid p-2 shadow-xl"
          >
            <div className="flex items-center px-2.5 pt-1.5 pb-2">
              <span className="font-extrabold text-ink-strong">{title}</span>
              <button
                type="button"
                onClick={() => {
                  setHover(null)
                  setOpen(true)
                }}
                className="ml-auto min-h-8 rounded-control px-1 text-xs font-bold text-accent-fg hover:underline"
              >
                Pin panel
              </button>
            </div>
            {flyout}
          </div>
        )}
      </nav>

      {showPanel && (
        <aside
          ref={asideRef}
          aria-label={title}
          style={{ width: resize.width }}
          className="relative z-10 flex shrink-0 flex-col border-r border-line bg-panel-solid p-3"
        >
          <div className="flex min-h-8 items-center gap-1.5 pt-0.5 pr-0 pb-2.5 pl-1.5">
            <h2 className="flex-1 truncate text-[15px] font-extrabold text-ink-strong">{title}</h2>
            {!inApps && panel?.action && (
              <PanelAction action={panel.action} onNavigate={onNavigate} />
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Collapse panel"
              title="Collapse panel"
              className={quiet}
            >
              <PanelCollapseIcon width={16} height={16} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {inApps ? (
              <AppsView
                items={items}
                activeId={activeApp?.id}
                heading={appsHeading}
                places={places}
                query={query}
                onQuery={setQuery}
                onPick={(item, event) => {
                  if (item.id !== activeApp?.id) return
                  event.preventDefault()
                  setView('section')
                }}
                onNavigate={onNavigate}
              />
            ) : (
              <>
                {panel?.content}
                {/* Where a page adds its own — see InSideMenu. Empty, it takes no room. */}
                <div ref={slots?.setPanel} className="flex min-h-0 flex-1 flex-col empty:hidden" />
              </>
            )}
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize the ${title} panel`}
            aria-valuenow={Math.round(resize.width)}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={MAX_WIDTH}
            tabIndex={0}
            title="Drag to resize · double-click to reset"
            onPointerDown={(event) =>
              resize.onPointerDown(event, asideRef.current?.getBoundingClientRect().left ?? 0)
            }
            onKeyDown={resize.onKeyDown}
            onDoubleClick={resize.reset}
            className="group absolute inset-y-0 -right-1.5 z-10 flex w-2.5 cursor-col-resize touch-none items-center justify-center"
          >
            <span
              aria-hidden
              className={`h-9 w-1 rounded-full transition-colors ${
                resize.dragging
                  ? 'bg-accent'
                  : 'bg-ink-soft/30 group-hover:bg-accent group-focus-visible:bg-accent'
              }`}
            />
          </div>
        </aside>
      )}
    </div>
  )
}

function PanelAction({
  action,
  onNavigate,
}: {
  action: SideMenuAction
  onNavigate?: NavigateHandler
}) {
  const icon = action.icon ?? <span aria-hidden>+</span>
  return action.href ? (
    <Link
      variant="plain"
      href={action.href}
      aria-label={action.label}
      title={action.label}
      onNavigate={onNavigate}
      onClick={action.onSelect}
      className={quiet}
    >
      {icon}
    </Link>
  ) : (
    <button
      type="button"
      onClick={action.onSelect}
      aria-label={action.label}
      title={action.label}
      className={quiet}
    >
      {icon}
    </button>
  )
}

type AppsViewProps = {
  items: MenuDestination[]
  activeId?: string
  heading?: string
  places: SideMenuPlace[]
  query: string
  onQuery: (query: string) => void
  onPick: (item: MenuDestination, event: MouseEvent) => void
  onNavigate?: NavigateHandler
}

/** Every top-level destination as a tile, and the pages visited lately. */
function AppsView({
  items,
  activeId,
  heading,
  places,
  query,
  onQuery,
  onPick,
  onNavigate,
}: AppsViewProps) {
  const needle = query.trim().toLowerCase()
  const tiles = items.filter((item) => item.label.toLowerCase().includes(needle))
  return (
    <div className="flex flex-col gap-0.5">
      <MenuPanelSearch
        label="Jump to a page"
        placeholder="Jump to a page…"
        value={query}
        onChange={onQuery}
      />
      {heading && <MenuPanelLabel>{heading}</MenuPanelLabel>}
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((item) => {
          const current = item.id === activeId
          return (
            <Link
              key={item.id}
              variant="plain"
              href={item.href}
              aria-current={current ? 'page' : undefined}
              onNavigate={onNavigate}
              onClick={(event) => onPick(item, event)}
              className={`flex flex-col items-start gap-2 rounded-surface border p-3 text-[13px] font-bold text-ink-strong transition ${
                current
                  ? 'border-accent bg-chip'
                  : 'border-line hover:border-ink-soft/40 hover:bg-tint/5'
              }`}
            >
              <span
                aria-hidden
                className={`grid size-[30px] place-items-center rounded-control [&>svg]:size-[18px] ${
                  current ? 'bg-accent text-on-accent' : 'bg-chip text-chip-fg'
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
      {tiles.length === 0 && (
        <p className="px-2 py-3 text-[13px] text-ink-soft">Nothing called “{query}”.</p>
      )}
      {places.length > 0 && (
        <>
          <MenuPanelLabel>Recent places</MenuPanelLabel>
          {places.map((place) => (
            <MenuPanelRow
              key={place.href + place.label}
              href={place.href}
              onNavigate={onNavigate}
              leading={
                place.icon && (
                  <span aria-hidden className="shrink-0 text-ink-soft [&>svg]:size-4">
                    {place.icon}
                  </span>
                )
              }
              name={place.label}
            />
          ))}
        </>
      )}
    </div>
  )
}
