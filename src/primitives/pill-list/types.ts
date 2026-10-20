import type { ReactNode } from 'react'
import type { PillSize, PillTone, PillVariant } from '../pill'

export type PillListItem = {
  /** Stable key. Also what keeps a pill from remounting when the list reorders. */
  id: string
  label: ReactNode
  /** Overrides the list's `tone` for this pill. */
  tone?: PillTone
  leadingIcon?: ReactNode
}

export type PillListProps = {
  items: PillListItem[]
  /**
   * How many pills show before the rest fold into a count. `0` shows only the
   * count; `Infinity` shows them all. Fractions round down, negatives to 0.
   */
  max?: number
  tone?: PillTone
  variant?: PillVariant
  size?: PillSize
  /**
   * The count stops growing here and reads `99+`, so a list of hundreds says
   * "a lot" instead of drawing a four-digit pill in a table cell.
   */
  overflowCap?: number
  /** Names the list for assistive tech — `Tags`, `Spaces`. */
  label?: string
  /** The count pill's accessible name. `(n) => \`${n} more\`` by default. */
  overflowLabel?: (hidden: number) => string
  /** Drawn when there are no items. Nothing, by default. */
  empty?: ReactNode
  /** Width of the card the hidden pills open in, before it is clamped to the screen. */
  cardMaxWidth?: number
  className?: string
}
