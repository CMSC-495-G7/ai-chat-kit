export type AddFacetRowProps = {
  types: string[]
  onAdd: (facet: { type: string; value: string }) => void
  describeType?: (type: string) => { placeholder?: string; hint?: string }
  title: string
  addLabel: string
  typeLabel?: string
  valueLabel?: string
  /**
   * Folds the whole block behind a single row until it is wanted. For the
   * widget panel, where about 90px of vertical is a real cost and hand entry
   * is the rarer of the two ways in.
   */
  collapsible?: boolean
}
