import type { KeyboardEvent } from 'react'
import type { MenuProps } from './types'

/**
 * A list of actions, usually inside a `Popover`.
 *
 * It owns the keyboard: Up and Down move between items, Home and End jump to
 * the ends, and Tab leaves the list. What an item does, and closing whatever
 * the menu sits in, are the host's.
 */
export function Menu({ className = '', onKeyDown, children, ...rest }: MenuProps) {
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'),
    ]
    if (items.length === 0) return
    const at = items.indexOf(document.activeElement as HTMLElement)
    const next =
      event.key === 'ArrowDown'
        ? items[(at + 1) % items.length]
        : event.key === 'ArrowUp'
          ? items[(at - 1 + items.length) % items.length]
          : event.key === 'Home'
            ? items[0]
            : event.key === 'End'
              ? items[items.length - 1]
              : null
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  return (
    <div role="menu" onKeyDown={move} className={`flex flex-col gap-0.5 ${className}`} {...rest}>
      {children}
    </div>
  )
}
