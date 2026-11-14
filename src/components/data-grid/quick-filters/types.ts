import type { QuickRow } from '../filterModel'

export type QuickFiltersProps = {
  rows: QuickRow[]
  /** Heading over the date rows. */
  datesLabel: string
  /** Heading over the rest. */
  valuesLabel: string
  customLabel: string
  /** The label of a yes-or-no filter's row, which has only the filter's own name as its pick. */
  onlyLabel: string
  hint: string
  /**
   * The exact-range button of a date row: open the panel on that date. Omit it
   * when there is no panel and the button is left out.
   */
  onCustom?: (fieldId: string) => void
  /** The link to the other style, when the host offers a choice. */
  switchLabel?: string
  onSwitch?: () => void
}
