import type { DateRangeFilterField, FilterPanelLabels } from '../types'

export type DateSectionProps = {
  fields: DateRangeFilterField[]
  labels: FilterPanelLabels
  /** The open row, by field id. Only read when there are two or more fields. */
  expanded: string
  onExpandedChange: (id: string) => void
}
