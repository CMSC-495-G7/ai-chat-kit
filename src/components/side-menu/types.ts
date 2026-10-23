import type { ReactNode } from 'react'
import type { NavigateHandler } from '../../primitives/link'

export type MenuDestination = {
  /** Stable key, unique across the whole menu. */
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** A count that needs someone — items waiting for review, say. */
  badge?: number
  /** Sub-sections. A destination with children expands in place. */
  children?: MenuDestination[]
}

export type MenuSection = {
  id: string
  /** Small heading above the group. The first group has none. */
  label?: string
  items: MenuDestination[]
}

export type SideMenuMode = 'expanded' | 'rail'

export type SideMenuProps = {
  /** Grouped destinations, already filtered to what the viewer can reach. */
  sections: MenuSection[]
  /** The destination being viewed — a top-level item or one of its children. */
  activeId?: string
  /** Full labels, or icons only. The host owns the choice and persists it. */
  mode?: SideMenuMode
  /** Ids of the items whose sub-sections are showing. Controlled. */
  openIds: string[]
  onOpenIdsChange: (ids: string[]) => void
  /** Overrides the handler from `NavigateProvider`. */
  onNavigate?: NavigateHandler
  label?: string
  className?: string
}
