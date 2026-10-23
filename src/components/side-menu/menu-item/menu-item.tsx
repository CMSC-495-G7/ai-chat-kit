import { ChevronDownIcon, ChevronRightIcon } from '../../../primitives/icons'
import { Link, type NavigateHandler } from '../../../primitives/link'
import { MenuBadge } from '../menu-badge'
import { holdsActive, rowBase, rowOff, rowOn } from '../rows'
import type { MenuDestination } from '../types'

export type MenuItemProps = {
  item: MenuDestination
  activeId?: string
  /** Whether the item's sub-sections are showing. */
  open: boolean
  onToggle: () => void
  onNavigate?: NavigateHandler
}

/** One destination in the expanded menu, with its sub-sections under it. */
export function MenuItem({ item, activeId, open, onToggle, onNavigate }: MenuItemProps) {
  const children = item.children ?? []
  const within = holdsActive(item, activeId)
  // With its sub-sections showing, the child carries the highlight and the
  // parent only goes bold; folded, the parent has to carry it alone.
  const highlighted = within && !(children.length > 0 && open)
  const link = (
    <Link
      variant="plain"
      href={item.href}
      aria-current={item.id === activeId ? 'page' : undefined}
      onNavigate={onNavigate}
      className={`${rowBase} ${children.length > 0 ? 'flex-1' : ''} ${
        highlighted ? rowOn : within ? 'font-bold text-ink-strong hover:bg-tint/5' : rowOff
      }`}
    >
      <span aria-hidden className={`shrink-0 ${within ? 'text-ink-strong' : 'text-ink-soft'}`}>
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (!open || children.length === 0) && (
        <MenuBadge count={item.badge} />
      )}
    </Link>
  )

  if (children.length === 0) return link

  return (
    <>
      <div className="flex items-center">
        {link}
        <button
          type="button"
          aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}`}
          aria-expanded={open}
          onClick={onToggle}
          className="grid size-11 shrink-0 place-items-center rounded-control text-ink-soft transition hover:bg-tint/5 hover:text-ink-strong"
        >
          {open ? (
            <ChevronDownIcon width={16} height={16} />
          ) : (
            <ChevronRightIcon width={16} height={16} />
          )}
        </button>
      </div>
      {open &&
        children.map((child) => (
          <Link
            key={child.id}
            variant="plain"
            href={child.href}
            aria-current={child.id === activeId ? 'page' : undefined}
            onNavigate={onNavigate}
            className={`${rowBase} ml-7 ${child.id === activeId ? rowOn : rowOff}`}
          >
            <span className="min-w-0 flex-1 truncate">{child.label}</span>
            {child.badge !== undefined && <MenuBadge count={child.badge} />}
          </Link>
        ))}
    </>
  )
}
