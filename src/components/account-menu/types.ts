import type { ReactNode } from 'react'
export type AccountMenuProps = {
  user: { name: string; initials: string; detail?: string }
  items: { id: string; label: string; hint?: string; icon?: ReactNode; onSelect: () => void }[]
  footer?: ReactNode
  trigger: 'avatar' | 'row'
  caption?: string
  label?: string
  triggerLabel?: string
  actionsLabel?: string
  popoverWidth?: number
  collapsed?: boolean
}
