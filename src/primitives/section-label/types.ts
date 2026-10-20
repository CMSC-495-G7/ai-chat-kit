import type { ReactNode } from 'react'

export type SectionLabelProps = {
  children: ReactNode
  /**
   * A prop rather than a caller-supplied `text-*`: two colour utilities on one
   * element resolve by stylesheet order, not by the order they appear in the
   * string, so a caller passing `text-caution` would win or lose at random.
   */
  tone?: 'soft' | 'caution'
  className?: string
}
