/**
 * Keyboard-shortcut labels, platform-aware.
 *
 * Apple's modifier glyphs (⌘ ⌥ ⌫ ↵) are how Mac software has always shown
 * shortcuts, and every Mac system font carries them. Windows and Linux have
 * no equivalent convention — there is no Option key for ⌥ to stand in for,
 * Backspace isn't drawn as a glyph in Windows menus, and a symbol a system
 * font lacks renders as a tofu box instead of silently falling back. So
 * everywhere but Apple hardware, a label spells the key out: Ctrl+Enter,
 * Alt+↑, Backspace — the convention those platforms' own apps use.
 *
 * (`aria-keyshortcuts` values are unaffected: that attribute takes token
 * names like "Alt Enter" regardless of platform or display label.)
 */
const isApplePlatform =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export const keyLabels = {
  /** Prefix for a Cmd/Ctrl combo: `${mod}${enter}` → "⌘↵" or "Ctrl+Enter". */
  mod: isApplePlatform ? '⌘' : 'Ctrl+',
  /** Prefix for an Option/Alt combo: `${alt}↑` → "⌥↑" or "Alt+↑". */
  alt: isApplePlatform ? '⌥' : 'Alt+',
  enter: isApplePlatform ? '↵' : 'Enter',
  backspace: isApplePlatform ? '⌫' : 'Backspace',
} as const
