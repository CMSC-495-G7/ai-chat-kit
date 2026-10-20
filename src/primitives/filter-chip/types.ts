/**
 * Three shapes for three different promises. `value` is something the index
 * vouched for. `query` is a predicate standing in for a selection too large to
 * enumerate. `custom` is something typed by hand that the index never offered
 * — dashed, because it carries no count and should not look as if it does.
 */
export type FilterChipTone = 'value' | 'query' | 'custom'

export type FilterChipProps = {
  label: string
  tone?: FilterChipTone
  /**
   * The field the chip constrains, rendered ahead of the label:
   * "Merchant: Delta Air Lines". A query prefix is already a phrase
   * ("Loan Number contains") and takes no colon.
   */
  prefix?: string
  /** A trailing figure — how many values a query chip matched. */
  count?: number
  /** Adds the remove button. Omit it for a read-only record. */
  onRemove?: () => void
  removeLabel?: string
  /**
   * The surface underneath. On a chip-tinted panel a `value` chip lifts to the
   * panel colour, or it would be tint on tint and vanish.
   */
  on?: 'panel' | 'tint'
  className?: string
}
