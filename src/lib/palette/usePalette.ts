import { useEffect } from 'react'
import type { PaletteOption } from '../settings/appearance'
import { applyPalette, CUSTOM_THEME_CLASS, type PaletteInput } from './palette'

function rootOr(target?: HTMLElement | null) {
  return target ?? (typeof document === 'undefined' ? null : document.documentElement)
}

/**
 * `applyPalette` as a hook: applies on mount and on change, and undoes it on
 * unmount. `null` applies nothing, so a caller can switch a custom palette
 * off without unmounting.
 *
 * The input is compared by value, so an object literal in the render is fine.
 * Defaults to `<html>` for the same reason `usePaletteClass` does: `body`
 * paints `var(--canvas)` from `:root`, and portals live under `body`.
 */
export function usePalette(input: PaletteInput | null | undefined, target?: HTMLElement | null) {
  const key = input ? JSON.stringify(input) : ''
  useEffect(() => {
    const el = rootOr(target)
    if (!key || !el) return
    return applyPalette(el, JSON.parse(key) as PaletteInput)
  }, [key, target])
}

/**
 * Applies whichever option `id` names: its `chat-theme-<id>` class from
 * brand.css, or its custom palette when it carries one (see `paletteOption`).
 * The hook a picker offering both kinds needs; `usePaletteClass` covers only
 * the shipped classes.
 */
export function usePaletteChoice(
  options: PaletteOption[],
  id: string,
  target?: HTMLElement | null,
) {
  const option = options.find((o) => o.id === id)
  const key = option?.palette ? JSON.stringify(option.palette) : ''
  const themeClass = option ? `chat-theme-${option.id}` : ''
  useEffect(() => {
    const el = rootOr(target)
    if (!el || !themeClass) return
    const previous = [...el.classList].filter(
      (c) => c.startsWith('chat-theme-') && c !== CUSTOM_THEME_CLASS,
    )
    el.classList.remove(...previous)
    if (key) return applyPalette(el, JSON.parse(key) as PaletteInput)
    el.classList.add(themeClass)
  }, [key, themeClass, target])
}
