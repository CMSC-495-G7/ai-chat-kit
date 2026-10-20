import type { ReactNode } from 'react'

export type InlineTipProps = {
  /** Small glyph on the left — an icon component instance, e.g. `<BulbIcon />`. */
  icon?: ReactNode
  /** The tip's copy. Keep it to one short sentence. */
  children: ReactNode
  /** Present → a dismiss (×) control renders and calls this on click. */
  onDismiss?: () => void
  /** Accessible label for the dismiss control. */
  dismissLabel?: string
}
