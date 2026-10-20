import type { ReactNode } from 'react'

export type SwitchProps = {
  /** The switch's accessible name. Rendered beside it unless `hideLabel`. */
  label: ReactNode
  hideLabel?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
  /** Secondary line under the label. */
  description?: ReactNode
  disabled?: boolean
  className?: string
  id?: string
}
