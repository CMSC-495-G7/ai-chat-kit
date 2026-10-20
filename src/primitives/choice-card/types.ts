import type { ChangeEventHandler, InputHTMLAttributes, ReactNode, Ref } from 'react'

export type ChoiceCardType = 'radio' | 'checkbox'

export type ChoiceCardProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children' | 'checked' | 'defaultChecked' | 'onChange' | 'size'
> & {
  type: ChoiceCardType
  /** Native form field name. Radio cards with the same name form one group. */
  name: string
  /** Controlled selection state. */
  checked: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  label: ReactNode
  description?: ReactNode
  /** Decorative artwork above the label. */
  icon?: ReactNode
  ref?: Ref<HTMLInputElement>
}
