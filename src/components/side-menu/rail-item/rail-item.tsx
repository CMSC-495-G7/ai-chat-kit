import { useState } from 'react'
import { Link, type NavigateHandler } from '../../../primitives/link'
import { Popover } from '../../../primitives/popover'
import { Tooltip } from '../../../primitives/tooltip'
import { MenuBadge } from '../menu-badge'
import { holdsActive, rowBase, rowOff, rowOn } from '../rows'
import type { MenuDestination } from '../types'

export type RailItemProps = {
  item: MenuDestination
  activeId?: string
  onNavigate?: NavigateHandler
}

/**
 * One destination in the icon rail. With sub-sections it opens them in a
 * flyout beside the icon; without, it is a link with a tooltip for its name.
 */
export function RailItem({ item, activeId, onNavigate }: RailItemProps) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const children = item.children ?? []
  const within = holdsActive(item, activeId)
  const box = `relative grid size-11 place-items-center rounded-control transition ${
    within
      ? 'bg-tint/7 text-ink-strong'
      : open
        ? 'bg-tint/5 text-ink-strong'
        : 'text-ink-soft hover:bg-tint/5 hover:text-ink-strong'
  }`
  const badge = item.badge !== undefined && <MenuBadge count={item.badge} corner />
  const name = item.badge ? `${item.label}, ${item.badge} waiting` : item.label

  if (children.length === 0) {
    return (
      <Tooltip content={item.label}>
        <Link
          variant="plain"
          href={item.href}
          aria-label={name}
          aria-current={item.id === activeId ? 'page' : undefined}
          onNavigate={onNavigate}
          className={box}
        >
          <span aria-hidden>{item.icon}</span>
          {badge}
        </Link>
      </Tooltip>
    )
  }

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        aria-label={name}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={item.label}
        onClick={() => setOpen((value) => !value)}
        className={box}
      >
        <span aria-hidden>{item.icon}</span>
        {badge}
      </button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label={`${item.label} sections`}
        width={232}
        align="side"
      >
        <p className="px-3 pt-1.5 pb-1.5 text-xs font-bold text-ink-soft">{item.label}</p>
        {children.map((child) => (
          <Link
            key={child.id}
            variant="plain"
            href={child.href}
            aria-current={child.id === activeId ? 'page' : undefined}
            onNavigate={onNavigate}
            onClick={() => setOpen(false)}
            className={`${rowBase} px-3 ${child.id === activeId ? rowOn : rowOff}`}
          >
            <span className="min-w-0 flex-1 truncate">{child.label}</span>
            {child.badge !== undefined && <MenuBadge count={child.badge} />}
          </Link>
        ))}
      </Popover>
    </>
  )
}
