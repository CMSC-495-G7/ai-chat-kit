import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import type { LinkProps } from '../link'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type AdaptiveButtonCollapse = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Glyph before the label. Sized by the caller, boxed by the button. */
  icon?: ReactNode
  /** Glyph after the label — a chevron on a menu trigger, say. */
  trailingIcon?: ReactNode
  /** Fills its container rather than hugging its label. */
  block?: boolean
  ref?: Ref<HTMLButtonElement>
}

export type ButtonLinkProps = Omit<LinkProps, 'variant'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Glyph before the label. Sized by the caller, boxed by the link. */
  icon?: ReactNode
  /** Glyph after the label. */
  trailingIcon?: ReactNode
  /** Fills its container rather than hugging its label. */
  block?: boolean
}

export type AdaptiveButtonProps = Omit<
  ButtonProps,
  'children' | 'icon' | 'trailingIcon' | 'block' | 'aria-label'
> & {
  /** Visible at roomy widths and retained as the accessible name when compact. */
  label: string
  /** Required because compact mode has no visible text. */
  icon: ReactNode
  /** Nearest container width that switches the control to its icon-only box. */
  collapseAt?: AdaptiveButtonCollapse
  /** Defaults to `label`. Rendered by the shared portalled Tooltip. */
  tooltip?: ReactNode
  'aria-label'?: string
}
