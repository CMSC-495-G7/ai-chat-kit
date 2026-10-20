import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

export type TextInputSize = 'sm' | 'md' | 'lg'

// `prefix` is a real (global) HTML attribute typed as string, so it has to be
// dropped before ours is declared — otherwise the two intersect into
// `string & ReactNode` and no element is assignable to it.
type TextInputBaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> & {
  size?: TextInputSize
  /** Inset keeps the focus indicator inside clipped/scrolling containers. */
  focusRing?: 'outer' | 'inset'
  /** Leading glyph inside the field. */
  icon?: ReactNode
  /** Chips, a scope button — anything rendered before the text cursor. */
  prefix?: ReactNode
  /** A `⌘K` hint, a unit — rendered after the field. */
  suffix?: ReactNode
  ref?: Ref<HTMLInputElement>
}

/**
 * A valid field carries a textual message as well as a visual mark. Colour
 * alone must never be the only way the state is communicated.
 */
type TextInputValidationProps =
  | {
      validationState?: undefined
      validationMessage?: never
      validationIcon?: never
    }
  | {
      validationState: 'valid'
      /** Announced when validity changes and included in the input description. */
      validationMessage: string
      /** Custom trailing mark, or `false` to omit the default check. */
      validationIcon?: ReactNode | false
    }

/** A clear button must always have a caller-provided accessible name. */
type TextInputClearProps =
  | { onClear?: undefined; clearLabel?: never }
  | { onClear: () => void; clearLabel: string }

export type TextInputProps = TextInputBaseProps & TextInputClearProps & TextInputValidationProps
