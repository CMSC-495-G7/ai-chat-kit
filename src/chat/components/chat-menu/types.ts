import type { AccountMenuProps } from '../../../components/account-menu'
import type { FacetFiltersProps } from '../../../components/facet-filters'

export type ChatMenuProps = {
  widthStorageKey?: string
  appName: string
  recentChats: { id: string; title: string; when: string }[]
  facets: Omit<FacetFiltersProps, 'railCollapsed' | 'onExpandRail'>
  account: Pick<AccountMenuProps, 'user' | 'items' | 'caption' | 'footer'>
  onSelectChat?: (id: string) => void
  open: boolean
  /** Desktop-only slim icon-rail state (ignored below the `lg` breakpoint). */
  collapsed: boolean
  onToggleCollapse: () => void
  onClose: () => void
  onNewChat: () => void
}
