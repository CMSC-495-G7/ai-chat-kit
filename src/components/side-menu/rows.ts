import type { MenuDestination } from './types'

// The row every destination is drawn as, shared by the expanded menu, its
// sub-sections and the rail's flyout so the three cannot drift.
export const rowBase =
  'flex h-11 min-w-0 items-center gap-2.5 rounded-control px-2.5 text-sm transition'
export const rowOn = 'bg-tint/7 font-bold text-ink-strong'
export const rowOff = 'font-medium text-ink hover:bg-tint/5'

/** Whether the item, or one of its sub-sections, is the one being viewed. */
export const holdsActive = (item: MenuDestination, activeId?: string) =>
  item.id === activeId || (item.children?.some((child) => child.id === activeId) ?? false)
