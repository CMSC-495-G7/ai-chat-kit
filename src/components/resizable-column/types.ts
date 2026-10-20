import type { ReactNode } from 'react'

export type ResizableColumnProps = {
  /** Starting width in px (also the fallback when nothing is stored). */
  initial: number
  /** When set, the width persists to localStorage across sessions. */
  storageKey?: string
  /** Smallest width the column may shrink to. */
  minWidth?: number
  /** Space that must remain for the sibling (chat) column. */
  minRemainder?: number
  'aria-label'?: string
  className?: string
  children: ReactNode
}
