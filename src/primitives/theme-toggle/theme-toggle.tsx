import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '../icons'
import type { ThemeToggleProps } from './types'

/** Default shared with brand/head.html. Hosts using a different key must align their bootstrap. */
export const THEME_MODE_KEY = 'chat-theme-mode'

export function ThemeToggle({
  dark: controlledDark,
  defaultDark,
  onDarkChange,
  storageKey = THEME_MODE_KEY,
  applyToDocument = true,
  lightLabel = 'Switch to light mode',
  darkLabel = 'Switch to dark mode',
  lightTitle = 'Light mode',
  darkTitle = 'Dark mode',
  className = '',
  onClick,
  ...rest
}: ThemeToggleProps = {}) {
  const [localDark, setLocalDark] = useState(
    () =>
      defaultDark ??
      (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')),
  )
  const dark = controlledDark ?? localDark
  useEffect(() => {
    if (applyToDocument) {
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.classList.toggle('light', !dark)
    }
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, dark ? 'dark' : 'light')
      } catch {
        /* Storage may be disabled by the host. */
      }
    }
  }, [dark, storageKey, applyToDocument])
  return (
    <button
      type="button"
      aria-label={dark ? lightLabel : darkLabel}
      title={dark ? lightTitle : darkTitle}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (controlledDark === undefined) setLocalDark(!dark)
        onDarkChange?.(!dark)
      }}
      className={`glass flex size-9 items-center justify-center rounded-full text-ink-soft transition hover:text-accent ${className}`}
    >
      {dark ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
    </button>
  )
}
