import type { ReactNode } from 'react'
export type SlideOverProps = {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  /** Fill the containing shell, or the viewport for a mobile panel. */
  position?: 'absolute' | 'fixed'
  /** The host may retain the scrim from an existing surface. */
  scrimClassName?: string
  shadow?: boolean
  side?: 'left' | 'right'
  className?: string
}
