import type { AskedOverChip, AskedOverScope } from '../../engine/types'

export type AskedOverStripProps = {
  /** The snapshot. Everything the strip draws comes from here. */
  scope: AskedOverScope
  /**
   * The filters in force now, as chips. Compared against `scope` to decide
   * "changed since" and never drawn. Omit it when the host does not track
   * scope; pass `[]` when it does and nothing is set.
   */
  current?: AskedOverChip[]
  /** Offered only once the scope has changed. Puts the recorded one back. */
  onRestore?: () => void
  /** Fewer labels in the collapsed line. Everything else is unchanged. */
  density?: 'comfortable' | 'compact'
  className?: string
}
