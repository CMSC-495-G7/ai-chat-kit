import { buttonClass } from './classes'
import type { ButtonProps } from './types'

/**
 * The text button for the core set.
 *
 * Presentational and uncontrolled: it has no loading state of its own and no
 * `href` form. Something that navigates is a link, and `ButtonLink` is the
 * link drawn this way — swapping the element under a component that says
 * "button" is how keyboard semantics quietly break.
 *
 * Focus comes from the global `:focus-visible` outline in brand/tokens.css, so there
 * is no ring class here; adding one would double the indicator.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  trailingIcon,
  block = false,
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const cls = buttonClass({ variant, size, block, className })

  return (
    <button type={type} className={cls} {...rest}>
      {icon && <span className="inline-grid shrink-0 place-items-center">{icon}</span>}
      {children}
      {trailingIcon && (
        <span className="inline-grid shrink-0 place-items-center">{trailingIcon}</span>
      )}
    </button>
  )
}
