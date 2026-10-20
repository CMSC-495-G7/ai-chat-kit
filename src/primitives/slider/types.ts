import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  showValue?: boolean
  formatValue?: (value: number) => ReactNode
  ref?: Ref<HTMLInputElement>
}
