import type { HTMLAttributes, ReactNode } from 'react'

export type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
  /** Names the menu for assistive technology. */
  'aria-label': string
  children: ReactNode
}

export type MenuItemProps = {
  label: ReactNode
  /** A quieter second line: what choosing this does. */
  hint?: ReactNode
  /** Glyph before the label. */
  icon?: ReactNode
  /** Anything after the label — a shortcut, a check mark. */
  trailing?: ReactNode
  onSelect: () => void
  disabled?: boolean
  /** `danger` for an entry that removes or discards something. */
  tone?: 'default' | 'danger'
  className?: string
}
