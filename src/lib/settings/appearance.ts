import { useEffect } from 'react'
import type { PaletteInput } from '../palette/palette'

/**
 * A palette a viewer can pick, as the picker renders it.
 *
 * `canvas`, `panel` and `action` are the theme's own `--canvas-dark`,
 * `--panel-solid-dark` and dark `--action`, copied as literals rather than
 * read from the cascade: a tile has to show a theme that is NOT the one
 * currently applied, so a `var()` would resolve every tile to the same colour.
 *
 * Dark values in both colour modes on purpose — the shipped themes are
 * near-identical in light, and a light preview would be identical tiles.
 */
export type PaletteOption = {
  /** The `chat-theme-<id>` class in brand.css — or, with `palette` set, just a
   *  key the picker reports. */
  id: string
  label: string
  hint?: string
  canvas: string
  panel: string
  /** The one saturated control the surfaces exist to set off. */
  action: string
  /** A custom palette built at runtime instead of a brand.css class. Build
   *  the whole option with `paletteOption`, and apply the choice with
   *  `usePaletteChoice`. */
  palette?: PaletteInput
}

/** brand.css §2 gives every shipped theme the same ember action fill. */
const EMBER_ACTION = '#ef6a00'

/** The palettes brand.css ships. A consuming app may offer its own, or a
 *  subset — a tenant that has bought one brand offers one. */
export const SHIPPED_PALETTES: PaletteOption[] = [
  {
    id: 'default',
    label: 'Navy',
    hint: 'The brand blue, pulled back from the saturation that made it read as a blue page rather than a dark one.',
    canvas: '#04172a',
    panel: '#0a2440',
    action: EMBER_ACTION,
  },
  {
    id: 'deep',
    label: 'Deep',
    hint: 'A corporate navy — deeper, cooler, pure white headings.',
    canvas: '#001e33',
    panel: '#04263c',
    action: EMBER_ACTION,
  },
  {
    id: 'graphite',
    label: 'Graphite',
    hint: 'Near-neutral charcoal. Same blue identity in light mode; in dark the colour budget goes to the send button instead of the field.',
    canvas: '#0f1214',
    panel: '#16191c',
    action: EMBER_ACTION,
  },
]

/** A `<mark>` colour from brand.css §5. `swatch` is the light-mode value — the
 *  deeper of each pair, so the dot reads on either panel. */
export type HighlightOption = { id: string; label: string; swatch: string }

export const SHIPPED_HIGHLIGHTS: HighlightOption[] = [
  { id: 'orange', label: 'Orange', swatch: '#ef6a00' },
  { id: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { id: 'yellow', label: 'Yellow', swatch: '#facc15' },
  { id: 'blue', label: 'Blue', swatch: '#2f7ad6' },
  { id: 'teal', label: 'Teal', swatch: '#14b8a6' },
  { id: 'violet', label: 'Violet', swatch: '#a855f7' },
]

/**
 * Applies a palette as a `chat-theme-*` class, removing whichever one was
 * there before.
 *
 * Defaults to `<html>` because `body` paints `var(--canvas)`, which resolves
 * at `:root` — a palette scoped to an inner element leaves the page behind it
 * on the old colours. The exception is the embedded widget, whose root IS its
 * own theme scope; pass that element as `target` there.
 *
 * This does not prevent a flash on first load: the class has to be on the
 * element before first paint, which means a small inline script in the
 * document head reading the same storage key.
 */
export function usePaletteClass(palette: string, target?: HTMLElement | null) {
  useEffect(() => {
    const el = target ?? (typeof document === 'undefined' ? null : document.documentElement)
    if (!el) return
    const previous = [...el.classList].filter((c) => c.startsWith('chat-theme-'))
    el.classList.remove(...previous)
    el.classList.add(`chat-theme-${palette}`)
  }, [palette, target])
}
