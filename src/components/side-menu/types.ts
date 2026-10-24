import type { ReactNode } from 'react'
import type { NavigateHandler } from '../../primitives/link'

export type MenuDestination = {
  /** Stable key, unique across the whole menu. Pinned pages store these. */
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** A count that needs someone — runs awaiting approval, say. */
  badge?: number
  /** Sub-sections: pages that live under this one. */
  children?: MenuDestination[]
  /** The short name under its icon in the rail ("Flows"). Defaults to `label`. */
  shortLabel?: string
}

export type MenuSection = {
  id: string
  /** Small heading above the group. The first group has none. */
  label?: string
  items: MenuDestination[]
}

/** The button at the end of a panel's heading: "New chat", "Start a workflow". */
export type SideMenuAction = {
  label: string
  icon?: ReactNode
  href?: string
  onSelect?: () => void
}

/** What the panel beside the rail holds while one app is the one you are in. */
export type SideMenuPanel = {
  /** The panel's heading. Defaults to the destination's label. */
  title?: string
  action?: SideMenuAction
  /** Under the heading. Built from the `MenuPanel…` pieces so panels read alike. */
  content?: ReactNode
  /**
   * A shorter version for the card that opens beside the rail while the panel
   * is shut and the pointer rests on the app's icon.
   */
  flyout?: ReactNode
}

/** A page visited lately, listed under All apps. */
export type SideMenuPlace = { label: string; href: string; icon?: ReactNode }

/** Pinned to the foot of the rail: Help, Settings. A page, or something that opens over this one. */
export type SideMenuFootLink = {
  id: string
  label: string
  icon: ReactNode
  href?: string
  onSelect?: () => void
}

export type SideMenuProps = {
  /** Every destination, grouped. All of them are reachable from All apps. */
  sections: MenuSection[]
  /** The top-level destinations that get a place in the rail, in order, by id. */
  rail: string[]
  /** The destination being viewed — a top-level item or one of its children. */
  activeId?: string
  /** A panel for each app that has one, by destination id. */
  panels?: Record<string, SideMenuPanel>
  /** Over the tiles in All apps: whose apps these are. */
  appsHeading?: string
  places?: SideMenuPlace[]
  footLinks?: SideMenuFootLink[]
  /** Whether the panel is showing. Leave out to let the menu keep it. */
  panelOpen?: boolean
  defaultPanelOpen?: boolean
  onPanelOpenChange?: (open: boolean) => void
  /** Where to remember the width the panel was dragged to. */
  widthStorageKey?: string
  /** Overrides the handler from `NavigateProvider`. */
  onNavigate?: NavigateHandler
  /** Names the rail for assistive technology. */
  label?: string
  className?: string
}
