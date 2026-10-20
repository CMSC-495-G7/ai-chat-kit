export type CountBadgeProps = {
  /** Nothing renders at zero or below. */
  count: number
  /**
   * Above this the badge reads "99+". An icon rail has room for three
   * characters beside a glyph, not four.
   */
  max?: number
  /**
   * `inline` sits in a row of text, like the Filters header. `corner` hangs
   * off an icon — whose wrapper must be `relative` — and grows away from it.
   */
  placement?: 'inline' | 'corner'
  className?: string
}
