import { Link } from '../../link'
import { buttonClass } from '../classes'
import type { ButtonLinkProps } from '../types'

/**
 * A link drawn as a button: for an action whose whole effect is going
 * somewhere — "Open workflows", "Review", "Add a source".
 *
 * It is an anchor, so it can be opened in a new tab and copied, and it routes
 * through `onNavigate` or `NavigateProvider` like any other `Link`. Use
 * `Button` for anything that does something on the page.
 */
export function ButtonLink({
  variant,
  size,
  icon,
  trailingIcon,
  block,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link variant="plain" className={buttonClass({ variant, size, block, className })} {...rest}>
      {icon && <span className="inline-grid shrink-0 place-items-center">{icon}</span>}
      {children}
      {trailingIcon && (
        <span className="inline-grid shrink-0 place-items-center">{trailingIcon}</span>
      )}
    </Link>
  )
}
