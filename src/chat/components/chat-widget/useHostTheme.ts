import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 'auto' follows the host page: a `dark`/`light` class on <html> wins (the
 * common convention, and what this repo's ThemeToggle sets); otherwise the
 * OS-level prefers-color-scheme decides. Hosts with other conventions can
 * pass an explicit 'light' | 'dark' or call setTheme() on the embed handle.
 */
function resolveAuto(): boolean {
  const html = document.documentElement
  if (html.classList.contains('dark')) return true
  if (html.classList.contains('light')) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useHostTheme(mode: ThemeMode): boolean {
  const [dark, setDark] = useState(() => (mode === 'auto' ? resolveAuto() : mode === 'dark'))

  useEffect(() => {
    if (mode !== 'auto') {
      setDark(mode === 'dark')
      return
    }

    const update = () => setDark(resolveAuto())
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', update)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', update)
    }
  }, [mode])

  return dark
}
