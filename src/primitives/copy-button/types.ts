import type { IconButtonProps } from '../icon-button'

export type CopyButtonProps = Omit<IconButtonProps, 'children' | 'onClick'> & {
  /** Exactly what lands on the clipboard. */
  text: string
  /** Accessible name at rest. Defaults to "Copy". */
  label?: string
  /** Announced, and used as the name while confirming. Defaults to "Copied". */
  copiedLabel?: string
  /** How long the confirmation holds, in ms. */
  holdMs?: number
  iconSize?: number
  /** Called with `text` after each copy. */
  onCopied?: (text: string) => void
}
