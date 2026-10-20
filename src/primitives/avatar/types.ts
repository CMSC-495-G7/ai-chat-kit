import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'

/** Named sizes cover common UI use; a pixel number preserves bespoke layouts. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | number
export type AvatarTone = 'neutral' | 'soft' | 'brand' | 'accent'

type AvatarBaseProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick'> & {
  shape?: 'circle' | 'square'
  size?: AvatarSize
  tone?: AvatarTone
  /** Renders a semantic button when present. Omit it for a display-only avatar. */
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export type AvatarProps = AvatarBaseProps &
  (
    | {
        variant: 'text'
        /** One to three initials or another short text fallback. */
        text: string
      }
    | {
        variant: 'image'
        src: string
        /** Describe the person; use an empty string when adjacent text already does. */
        alt: string
      }
    | {
        variant: 'icon'
        icon: ReactNode
        /** Names the otherwise non-text avatar for assistive technology. */
        label: string
      }
  )
