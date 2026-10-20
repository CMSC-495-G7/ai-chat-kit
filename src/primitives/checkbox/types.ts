import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /**
   * Neither checked nor unchecked — a header box over a partial selection.
   * It is a DOM property, not an attribute, so it can only be set through a
   * ref; `checked` is forced off while it is on, which is what a screen reader
   * expects from `aria-checked="mixed"`.
   */
  indeterminate?: boolean
  /** Renders the box inside a `<label>` with this text. */
  label?: ReactNode
  /** Right-aligned secondary text — a facet count, typically. */
  meta?: ReactNode
  ref?: Ref<HTMLInputElement>
}
