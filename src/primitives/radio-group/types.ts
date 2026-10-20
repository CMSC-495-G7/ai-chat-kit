import type { HTMLAttributes, InputHTMLAttributes, Ref } from 'react'

export type RadioGroupOrientation = 'horizontal' | 'vertical'

export type RadioGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> & {
  name: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: RadioGroupOrientation
  disabled?: boolean
  ref?: Ref<HTMLDivElement>
}

export type RadioGroupItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name' | 'value' | 'checked' | 'defaultChecked' | 'onChange'
> & {
  value: string
  ref?: Ref<HTMLInputElement>
}
