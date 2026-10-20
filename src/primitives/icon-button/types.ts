import type { ButtonHTMLAttributes, Ref } from 'react'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'rounded'
  active?: boolean
  /** Spread onto the button with the rest of the props — React 19 passes a
   *  ref like any other, so no forwardRef wrapper is needed. Callers that
   *  restore focus to a trigger (a menu button, say) need it. */
  ref?: Ref<HTMLButtonElement>
}
