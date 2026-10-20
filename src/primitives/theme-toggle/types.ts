import type { ButtonHTMLAttributes } from 'react'

export type ThemeToggleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Controlled theme. Omit to derive the initial theme from the document. */
  dark?: boolean
  defaultDark?: boolean
  onDarkChange?: (dark: boolean) => void
  /** Default THEME_MODE_KEY. Pass null to disable persistence. */
  storageKey?: string | null
  /** Default true. False lets a host apply its own theme scope. */
  applyToDocument?: boolean
  lightLabel?: string
  darkLabel?: string
  lightTitle?: string
  darkTitle?: string
}
