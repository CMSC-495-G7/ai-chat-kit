import type { ReactNode } from 'react'

export type HoverCardProps = {
  /** The element the card points at. Null until the trigger mounts. */
  anchor: HTMLElement | null
  open: boolean
  /** Card width, before it is clamped to the space available. */
  maxWidth?: number
  /** Cap for the body's own scroll height, before it is clamped to the space
   *  between the anchor and the nearer viewport edge. */
  maxHeight?: number
  /** From useHoverCard's `cardProps` — keeps the card open while the pointer
   *  is on it, which is what makes it hoverable under WCAG 1.4.13. */
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  children: ReactNode
}
