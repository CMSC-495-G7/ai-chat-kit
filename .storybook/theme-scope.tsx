import { useLayoutEffect, type ReactNode } from 'react'
import { applyPalette } from '../src/lib/palette/palette'
import { SAMPLE_CUSTOM_PALETTES } from '../src/fixtures/palettes'

/**
 * Themes go on `<html>`, never a wrapper div. `body` paints `var(--canvas)`
 * from `:root`, and HoverCard, Tooltip and Modal portal into `document.body` —
 * a class on an inner element would leave both on the previous palette.
 *
 * A shipped palette is its `chat-theme-<id>` class from brand.css; a custom one
 * (teal, plum, crimson) is built at runtime and applied as inline variables under
 * `chat-theme-custom`, undone when the toolbar moves off it.
 */
export function ThemeScope({
  mode,
  palette,
  highlight,
  children,
}: {
  mode: 'light' | 'dark'
  palette: string
  highlight: string
  children: ReactNode
}) {
  useLayoutEffect(() => {
    const root = document.documentElement
    const stale = [...root.classList].filter(
      (c) => c.startsWith('chat-theme-') || c.startsWith('chat-highlight-'),
    )
    root.classList.remove(...stale, 'light', 'dark')
    root.classList.add(mode, `chat-highlight-${highlight}`)
    const custom = SAMPLE_CUSTOM_PALETTES.find((p) => p.id === palette)?.palette
    if (custom) return applyPalette(root, custom)
    root.classList.add(`chat-theme-${palette}`)
  }, [mode, palette, highlight])
  return children
}
