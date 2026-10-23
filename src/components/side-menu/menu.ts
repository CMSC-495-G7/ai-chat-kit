// Reading a menu: which destination a path belongs to, and what sits under what.
// Plain functions over the same data `SideMenu` draws.
import type { MenuDestination, MenuSection } from './types'

/** Every destination, children included, in menu order. */
export function flattenMenu(sections: MenuSection[]): MenuDestination[] {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => [item, ...(item.children ?? [])]),
  )
}

/**
 * The destination a path belongs to: the longest href that the path starts
 * with. `/projects/42` resolves to Projects (`/projects`), so a page with no
 * menu entry of its own still lights up where it lives. On a tie the later
 * entry wins — a sub-section that shares its parent's href is the more
 * specific answer, and it is listed after the parent.
 */
export function matchDestination(
  sections: MenuSection[],
  pathname: string,
): MenuDestination | undefined {
  let best: MenuDestination | undefined
  for (const item of flattenMenu(sections)) {
    if (pathname !== item.href && !pathname.startsWith(`${item.href}/`)) continue
    if (!best || item.href.length >= best.href.length) best = item
  }
  return best
}

/** The item a destination sits under, for a context label beside a sub-page. */
export function parentOf(sections: MenuSection[], id: string): MenuDestination | undefined {
  return sections
    .flatMap((section) => section.items)
    .find((item) => item.children?.some((child) => child.id === id))
}
