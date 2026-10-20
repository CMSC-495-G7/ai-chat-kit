import type { CSSProperties } from 'react'
import type { FacetRowModel } from '../facetRules'

export type FacetRowProps = {
  row: FacetRowModel
  /** Counts are mid-flight: show a bar, keep the row clickable. */
  refreshing: boolean
  showCount?: boolean
  countText?: (count: number | null | undefined) => string
  resultsText?: (count: number) => string
  onToggle: (value: string) => void
  /** Fixed height, for rows inside a virtual window. */
  height?: number
  /** Set on virtualized rows, where only a slice of the list is in the tree. */
  posInSet?: number
  setSize?: number
  style?: CSSProperties
  index?: number
  tabIndex?: number
  onFocus?: () => void
}
