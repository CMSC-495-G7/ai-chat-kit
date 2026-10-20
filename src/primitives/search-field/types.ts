import type { InputHTMLAttributes } from 'react'
export type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  /** Visual field size; native input size is still forwarded. */
  fieldSize?: 'sm' | 'md' | 'lg'
  containerClassName?: string
}
