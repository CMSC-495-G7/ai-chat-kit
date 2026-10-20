import { followLink, useNavigate } from './navigation'
import type { LinkProps, LinkVariant } from './types'

const variants: Record<LinkVariant, string> = {
  text: 'inline-flex items-center gap-0.5 font-semibold text-accent-fg hover:underline',
  plain: '',
}

/**
 * A real anchor that a host can route on the client.
 *
 * No component in the library imports a router. A link takes an `href`, so
 * open-in-new-tab and copy-link work, and hands a plain left click to
 * `onNavigate` — this link's own, or the one from `NavigateProvider`. With
 * neither, it is an ordinary link.
 */
export function Link({
  href,
  variant = 'text',
  onNavigate,
  onClick,
  className = '',
  ...rest
}: LinkProps) {
  const fromContext = useNavigate()
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        followLink(event, href, onNavigate ?? fromContext)
      }}
      className={`${variants[variant]} ${className}`.trim() || undefined}
      {...rest}
    />
  )
}
