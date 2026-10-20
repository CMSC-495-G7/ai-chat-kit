import type { ReactElement, ReactNode } from 'react'

export type TooltipPlacement = 'top' | 'bottom'

export type TooltipProps = {
  /** Short supplementary text. The trigger still needs its own accessible name. */
  content: ReactNode
  children: ReactElement<{ 'aria-describedby'?: string }>
  placement?: TooltipPlacement
  disabled?: boolean
  /** Pointer-hover delay. Keyboard focus always opens immediately. */
  delay?: number
}
