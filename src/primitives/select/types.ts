import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'

export type SelectSize = 'sm' | 'md'

export type SelectOption = {
  value: string | number
  label: ReactNode
  disabled?: boolean
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> & {
  size?: SelectSize
  /** Rendered as `<option>`s. Pass `children` instead for groups. */
  options?: SelectOption[]
  children?: ReactNode
  ref?: Ref<HTMLSelectElement>
}
