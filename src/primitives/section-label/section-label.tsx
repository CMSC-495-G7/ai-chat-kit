import type { SectionLabelProps } from './types'

/**
 * The small caps heading that names a block inside a panel.
 *
 * One copy, because written out by hand it is exactly the kind of thing that
 * drifts: one of them ends up semibold, or at 10px, and nobody notices until
 * two panels sit side by side.
 */
export function SectionLabel({ children, className = '', tone = 'soft' }: SectionLabelProps) {
  return (
    <span
      className={`text-[11px] font-bold tracking-[0.14em] uppercase ${
        tone === 'caution' ? 'text-caution' : 'text-ink-soft'
      } ${className}`}
    >
      {children}
    </span>
  )
}
