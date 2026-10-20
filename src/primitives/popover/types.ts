import type { ReactNode } from 'react'

export type PopoverAlign = 'start' | 'end' | 'side' | 'above'

export type PopoverProps = {
  /** The control the panel hangs from. Nothing renders until it is mounted. */
  anchor: HTMLElement | null
  open: boolean
  /** Asked for on Escape and on a press outside both the panel and the anchor. */
  onClose: () => void
  /** Accessible name for the panel. */
  label: string
  /** Width in pixels. The panel is fixed-width so it can be placed before it paints. */
  width: number
  /**
   * Where the panel sits. `start` and `end` hang below the anchor, lined up
   * with its left or right edge. `side` opens to the anchor's right, level
   * with its top — for a control in a narrow rail. `above` rises from an
   * anchor pinned to the bottom of the screen.
   */
  align?: PopoverAlign
  /** `dialog` for a panel of mixed content, `menu` for a list of actions. */
  role?: 'dialog' | 'menu'
  className?: string
  children: ReactNode
}
