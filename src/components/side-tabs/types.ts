import type { ReactNode } from 'react'

/**
 * One tab on the vertical icon rail: an id + icon + label (and an optional
 * count badge). The host decides what panel content a tab opens.
 */
export type SideTab = {
  id: string
  label: string
  icon: ReactNode
  /** Small count bubble on the icon (e.g. number of active filters). */
  badge?: number
}

export type SideTabRailProps = {
  tabs: SideTab[]
  activeId: string | null
  /** Called with null when the active tab is clicked again (toggle close). */
  onSelect: (id: string | null) => void
}

export type SideTabPanelProps = {
  title: string
  closeLabel?: string
  className?: string
  onClose: () => void
  /**
   * The body owns its own padding and scrolling. For a panel whose content
   * has to pin something to the bottom — a filter panel's Done bar — which a
   * scrolling, padded body would carry away with it.
   */
  fill?: boolean
  children: ReactNode
}
