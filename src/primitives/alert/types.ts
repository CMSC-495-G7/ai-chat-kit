import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'

export type AlertTone = 'info' | 'success' | 'warning' | 'error'

export type AlertAction = {
  label: ReactNode
  onClick: MouseEventHandler<HTMLButtonElement>
  ariaLabel?: string
  disabled?: boolean
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: AlertTone
  title: ReactNode
  /** @deprecated No longer drawn: the tone lives in the icon tile and the action. */
  bordered?: boolean
  /**
   * `stack` (default) puts the actions under the copy. `inline` keeps title,
   * copy and actions on one line — a page-level banner — and wraps when it
   * runs out of room.
   */
  layout?: 'stack' | 'inline'
  /** Supporting copy beneath the title. */
  children?: ReactNode
  /** Highlighted facts or problems rendered as a semantic list. */
  items?: readonly ReactNode[]
  /** The one thing to do next, as a button in the tone's own colour: Retry in red, Review in amber. */
  action?: AlertAction
  /** A second, quieter way out, drawn as a tone-coloured text link: "Publish anyway". */
  secondaryAction?: AlertAction
  /** Present to add a dismiss button. */
  onDismiss?: MouseEventHandler<HTMLButtonElement>
  dismissLabel?: string
  /** Overrides the tone's default glyph; `false` removes it. */
  icon?: ReactNode | false
  /** Arbitrary content disclosed through a native, keyboard-accessible details element. */
  details?: ReactNode
  detailsLabel?: ReactNode
}
