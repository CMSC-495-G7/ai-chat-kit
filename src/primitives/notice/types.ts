import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import type { AlertTone } from '../alert'

export type NoticeTone = AlertTone

export type NoticeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  tone?: NoticeTone
  /** The message — one short line. Bold by default; wrap tip copy in a normal-weight span. */
  children: ReactNode
  /** A short tag after the message that names the state in words: "Loading", "3 sources", "Failed". */
  label?: ReactNode
  /** Overrides the tone's glyph; `false` removes it. */
  icon?: ReactNode | false
  /** One inline action at the end of the line, as tone-coloured text: "Retry", "Show sources". */
  action?: {
    label: ReactNode
    onClick: MouseEventHandler<HTMLButtonElement>
    ariaLabel?: string
  }
  /** Present to add a dismiss button. */
  onDismiss?: MouseEventHandler<HTMLButtonElement>
  dismissLabel?: string
}
