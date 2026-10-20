import type { FieldsetHTMLAttributes, HTMLAttributes, LabelHTMLAttributes, Ref } from 'react'

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  'data-invalid'?: boolean
  'data-disabled'?: boolean
  ref?: Ref<HTMLDivElement>
}

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  ref?: Ref<HTMLLabelElement>
}
export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  ref?: Ref<HTMLParagraphElement>
}
export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement> & {
  ref?: Ref<HTMLParagraphElement>
}
export type FieldGroupProps = HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }
export type FieldSetProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  ref?: Ref<HTMLFieldSetElement>
}
export type FieldLegendProps = HTMLAttributes<HTMLLegendElement> & {
  ref?: Ref<HTMLLegendElement>
}
