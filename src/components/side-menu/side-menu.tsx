import { MenuItem } from './menu-item'
import { RailItem } from './rail-item'
import type { SideMenuProps } from './types'

/**
 * A side menu: small labelled groups of destinations, each able
 * to open into its sub-sections, and the whole thing able to fold to an icon
 * rail that still works.
 *
 * In the rail, an item with sub-sections opens them in a flyout beside its
 * icon rather than expanding in place — there is no room in 64px — and an item
 * without any is a plain link with a tooltip for its name.
 */
export function SideMenu({
  sections,
  activeId,
  mode = 'expanded',
  label = 'Main',
  openIds,
  onOpenIdsChange,
  onNavigate,
  className = '',
}: SideMenuProps) {
  const rail = mode === 'rail'
  const toggle = (id: string) =>
    onOpenIdsChange(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id])

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-y-auto border-r border-line bg-panel-solid ${
        rail ? 'w-16 items-center px-0 py-3' : 'w-62 p-3'
      } ${className}`}
    >
      <nav aria-label={label} className={`flex flex-col gap-0.5 ${rail ? 'items-center' : ''}`}>
        {sections.map((section, index) => (
          <div key={section.id} className={`flex flex-col gap-0.5 ${rail ? 'items-center' : ''}`}>
            {index > 0 &&
              (rail ? (
                <span aria-hidden className="my-2 h-px w-7 bg-line" />
              ) : (
                section.label && (
                  <h2 className="px-2.5 pt-4 pb-1.5 text-xs font-semibold text-ink-soft">
                    {section.label}
                  </h2>
                )
              ))}
            {section.items.map((item) =>
              rail ? (
                <RailItem key={item.id} item={item} activeId={activeId} onNavigate={onNavigate} />
              ) : (
                <MenuItem
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  open={openIds.includes(item.id)}
                  onToggle={() => toggle(item.id)}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
