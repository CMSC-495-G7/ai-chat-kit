import { useState } from 'react'
import { Avatar } from '../../primitives/avatar'
import { ChevronDownIcon } from '../../primitives/icons'
import { Menu, MenuItem } from '../../primitives/menu'
import { Popover } from '../../primitives/popover'
import type { AccountMenuProps } from './types'

/** One account entry point for a top bar or a sidebar footer. */
export function AccountMenu({
  user,
  items,
  footer,
  trigger: kind,
  caption,
  label = 'Account',
  triggerLabel = `Account: ${user.name}`,
  actionsLabel = 'Account actions',
  popoverWidth = 272,
  collapsed = false,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const avatar = kind === 'avatar'
  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={triggerLabel}
        title={user.name}
        onClick={() => setOpen((value) => !value)}
        className={
          avatar
            ? 'grid size-11 shrink-0 place-items-center rounded-control transition hover:bg-white/10'
            : `flex w-full items-center gap-3 rounded-control p-1 text-left transition hover:bg-panel ${collapsed ? 'lg:justify-center' : ''}`
        }
      >
        {avatar ? (
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-950"
          >
            {user.initials}
          </span>
        ) : (
          <>
            <Avatar variant="text" text={user.initials} size={32} tone="brand" aria-hidden />
            <span
              className={`min-w-0 flex-1 text-[13px] leading-tight ${collapsed ? 'lg:hidden' : ''}`}
            >
              <span className="block truncate font-semibold text-ink-strong">{user.name}</span>
              <span className="block truncate text-ink-soft">{caption ?? user.detail}</span>
            </span>
            <ChevronDownIcon
              width={15}
              height={15}
              className={`shrink-0 text-ink-soft transition-transform ${open ? '' : 'rotate-180'} ${collapsed ? 'lg:hidden' : ''}`}
            />
          </>
        )}
      </button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        width={popoverWidth}
        align={avatar ? 'end' : 'above'}
      >
        <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
          <Avatar variant="text" text={user.initials} size={36} tone="brand" aria-hidden />
          <span className="min-w-0 text-[13px] leading-tight">
            <span className="block truncate font-semibold text-ink-strong">{user.name}</span>
            {user.detail && <span className="block truncate text-ink-soft">{user.detail}</span>}
          </span>
        </div>
        <Menu aria-label={actionsLabel} className="border-t border-line pt-1.5">
          {items.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              hint={item.hint}
              icon={item.icon}
              onSelect={() => {
                setOpen(false)
                item.onSelect()
              }}
            />
          ))}
        </Menu>
        {footer && (
          <div className="mt-1.5 flex items-center gap-3 border-t border-line px-3 pt-2.5 pb-1">
            {footer}
          </div>
        )}
      </Popover>
    </>
  )
}
