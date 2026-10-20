import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'

/**
 * Semantic tones are named for what they mean, never for where they are used.
 * A tone called `active` or `draft` is one domain's vocabulary borrowed into a
 * primitive — the next table along has `settled` and `reconciling`.
 *
 * The literal colour tones are for cases where colour itself is the caller's
 * data. They use Pill-specific theme tokens rather than introducing general
 * green/yellow ramps for unrelated components.
 */
export type PillTone =
  | 'brand'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'green'
  | 'orange'
  | 'yellow'
  | 'red'

/**
 * `soft` is a tinted fill, `outline` a hairline on nothing.
 *
 * Use `outline` where pills sit on an already-tinted surface — a selected row,
 * a caution banner — and the soft fills stop separating from it. Both carry a
 * border so a mixed row keeps one baseline. Semantic soft tones use a
 * transparent border; the literal colour tones keep the coloured hairline
 * shown in the chip palette.
 */
export type PillVariant = 'soft' | 'outline'
export type PillSize = 'sm' | 'md' | 'lg'

type PillBaseProps = Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> & {
  tone?: PillTone
  variant?: PillVariant
  size?: PillSize
  /** A leading dot, for scanning a dense column. Decoration, not a channel. */
  dot?: boolean
  /** A decorative leading glyph. The visible pill label carries its meaning. */
  leadingIcon?: ReactNode
  /** A leading identity mark. Usually an `Avatar` with no click action of its own. */
  avatar?: ReactNode
  children: ReactNode
}

type ActionablePillProps = {
  /** Makes the entire pill a native button. Mutually exclusive with `onClose`. */
  onClick: MouseEventHandler<HTMLButtonElement>
  onClose?: never
  closeLabel?: never
}

type DismissiblePillProps = {
  onClick?: never
  /** Adds a trailing dismiss button. */
  onClose?: MouseEventHandler<HTMLButtonElement>
  /** Accessible name for the dismiss button. Inferred from string children when omitted. */
  closeLabel?: string
}

export type PillProps = PillBaseProps & (ActionablePillProps | DismissiblePillProps)
