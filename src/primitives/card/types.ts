import type { HTMLAttributes, ReactNode } from 'react'

export type CardAction = {
  /** Stable action identity. */
  id: string
  /** Visible action name. */
  label: string
  /** Called after closing the action disclosure. */
  onSelect: () => void
  /** Keeps an unavailable action visible. */
  disabled?: boolean
}

export type CardMove = { x: number; y: number }

/** Movement is incremental CSS pixels. The parent owns position, bounds and persistence. */
export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'title' | 'draggable' | 'onMove'> & {
  /** Heading for the content surface. */
  title: ReactNode
  /** A short brand-coloured label above the title that names the kind of card — "Security", "Last 30 days". */
  eyebrow?: ReactNode
  /** One line under the title. */
  description?: ReactNode
  /** A leading glyph, shown in a tinted tile. Decorative: the title names the card. */
  icon?: ReactNode
  /** Neutral muted tile by default. Use warning only for a caution explained by the card's text. */
  iconTone?: 'neutral' | 'warning'
  /** The heading's level. Defaults to 3. */
  headingLevel?: 2 | 3 | 4
  /** Controls beside the actions disclosure — a small button or a toggle. */
  headerAction?: ReactNode
  /** Pinned to the bottom of the card: a line of meta text, a link, or buttons. */
  footer?: ReactNode
  /**
   * Makes the whole card one link to `href`: the title becomes a native
   * anchor stretched over the card, so modified clicks open a new tab. Header
   * controls and actions stay separately clickable above it.
   */
  href?: string
  /** Omit or leave empty to hide the ellipsis. */
  actions?: readonly CardAction[]
  actionsLabel?: string
  actionsMenuLabel?: string
} & (
    | {
        draggable?: false
        onMove?: never
        keyboardMoveStep?: never
        dragLabel?: never
        dragDescription?: never
        onMoveStart?: never
        onMoveEnd?: never
      }
    | {
        /** Enables the handle. Static by default. */
        draggable: true
        /** Incremental pointer pixels or keyboard steps set by keyboardMoveStep; parent owns layout. */
        onMove: (delta: CardMove) => void
        /** Pixels per arrow-key move. Defaults to 10. */
        keyboardMoveStep?: number
        /** Accessible handle name. */
        dragLabel?: string
        /** Instructions matching the parent's movement behavior. */
        dragDescription?: string
        /** Pointer gesture began. Keyboard moves call onMove directly. */
        onMoveStart?: () => void
        /** Pointer gesture ended; true means Escape, cancellation or lost capture. */
        onMoveEnd?: (cancelled: boolean) => void
      }
  )
