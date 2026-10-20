import { createContext, useContext, type MouseEvent } from 'react'
import type { NavigateHandler } from './types'

const NavigateContext = createContext<NavigateHandler | undefined>(undefined)

/**
 * Tells every `Link` below it how to navigate. An app with a client-side
 * router sets it once at the root:
 *
 *     <NavigateProvider value={(href, event) => { event.preventDefault(); navigate(href) }}>
 *
 * Without one, a link is an ordinary anchor and the browser does the rest.
 */
export const NavigateProvider = NavigateContext.Provider

/** The handler in force here: the nearest provider's, if any. */
export function useNavigate(): NavigateHandler | undefined {
  return useContext(NavigateContext)
}

/**
 * Runs `onNavigate` for a plain left click and leaves every other kind alone,
 * so ⌘-click, middle-click and "copy link" keep working on what is still a
 * real anchor.
 */
export function followLink(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: NavigateHandler,
) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  onNavigate?.(href, event)
}
