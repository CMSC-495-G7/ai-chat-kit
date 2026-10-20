import { CountBadge } from '../../primitives/count-badge'
import { XIcon } from '../../primitives/icons'
import { IconButton } from '../../primitives/icon-button'
import { Tabs, TabsList, TabsTrigger } from '../../primitives/tabs'
import type { SideTabRailProps, SideTabPanelProps } from './types'

/**
 * A vertical icon rail with slide-in panels, modeled after the side tabs in
 * builder-style UIs. The rail is generic: each tab is an id + icon + label
 * (and an optional count badge), and the host decides what panel content a
 * tab opens. Adding a tab is one entry in the host's tabs array.
 */
export function SideTabRail({ tabs, activeId, onSelect }: SideTabRailProps) {
  return (
    <Tabs
      value={activeId}
      onValueChange={onSelect}
      allowDeselect
      orientation="vertical"
      activationMode="manual"
      className="w-10 shrink-0"
    >
      <TabsList
        variant="unstyled"
        className="flex w-10 flex-col items-center gap-1 border-r border-line py-2"
      >
        {tabs.map((tab, index) => {
          const active = tab.id === activeId
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              controls={false}
              tabIndex={activeId == null && index === 0 ? 0 : undefined}
              // The count is drawn, so it has to be said too.
              aria-label={tab.badge ? `${tab.label}, ${tab.badge}` : tab.label}
              title={tab.label}
              className={`relative grid size-8 place-items-center rounded-control transition ${
                active
                  ? 'bg-chip text-chip-fg'
                  : 'text-ink-soft hover:bg-tint/8 hover:text-ink-strong'
              }`}
            >
              {tab.icon}
              <CountBadge count={tab.badge ?? 0} placement="corner" />
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

/** Shared chrome for a tab's panel: titled header with close, scrollable body. */
export function SideTabPanel({
  title,
  onClose,
  fill = false,
  children,
  closeLabel = `Close ${title.toLowerCase()}`,
  className = '',
}: SideTabPanelProps) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-strong">{title}</p>
        <IconButton onClick={onClose} aria-label={closeLabel} title={closeLabel}>
          <XIcon width={14} height={14} />
        </IconButton>
      </div>
      <div
        className={`${fill ? 'flex min-h-0 flex-1 flex-col' : 'min-h-0 flex-1 overflow-y-auto px-4 py-3'} ${className}`}
      >
        {children}
      </div>
    </>
  )
}
