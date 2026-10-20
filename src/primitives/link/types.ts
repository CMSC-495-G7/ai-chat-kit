import type { AnchorHTMLAttributes, MouseEvent, Ref } from 'react'

/**
 * Called for a plain left click on a link. A host with a client-side router
 * prevents the default here and pushes the route. Modified clicks — ⌘, Ctrl,
 * Shift, Alt, middle button — never reach it, so open-in-new-tab keeps working.
 */
export type NavigateHandler = (href: string, event: MouseEvent<HTMLAnchorElement>) => void

export type LinkVariant = 'text' | 'plain'

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  /** A real address, so copy-link and open-in-new-tab work. */
  href: string
  /**
   * `text` is the standard inline link: accent colour, semibold, underlined on
   * hover. `plain` adds nothing, for a link that is a whole row, tab or tile
   * and brings its own classes.
   */
  variant?: LinkVariant
  /** Overrides the handler from `NavigateProvider` for this link. */
  onNavigate?: NavigateHandler
  ref?: Ref<HTMLAnchorElement>
}
