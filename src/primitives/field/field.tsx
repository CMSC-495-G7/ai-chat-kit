import type {
  FieldDescriptionProps,
  FieldErrorProps,
  FieldGroupProps,
  FieldLabelProps,
  FieldLegendProps,
  FieldProps,
  FieldSetProps,
} from './types'

const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ')

export function Field({ className = '', ...rest }: FieldProps) {
  return (
    <div
      role="group"
      className={join(
        'group/field flex min-w-0 flex-col gap-1.5',
        'data-[disabled=true]:opacity-60',
        className,
      )}
      {...rest}
    />
  )
}

export function FieldLabel({ className = '', ...rest }: FieldLabelProps) {
  return (
    <label
      className={join(
        'w-fit text-[12.5px] font-bold text-ink-strong',
        'group-data-[invalid=true]/field:text-danger-fg',
        'group-data-[disabled=true]/field:cursor-not-allowed',
        className,
      )}
      {...rest}
    />
  )
}

export function FieldDescription({ className = '', ...rest }: FieldDescriptionProps) {
  return <p className={join('text-[11.5px] leading-relaxed text-ink-soft', className)} {...rest} />
}

export function FieldError({ className = '', ...rest }: FieldErrorProps) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={join('text-[11.5px] font-medium leading-relaxed text-danger-fg', className)}
      {...rest}
    />
  )
}

export function FieldGroup({ className = '', ...rest }: FieldGroupProps) {
  return <div className={join('flex min-w-0 flex-col gap-5', className)} {...rest} />
}

export function FieldSet({ className = '', ...rest }: FieldSetProps) {
  return (
    <fieldset
      className={join(
        'group/fieldset flex min-w-0 flex-col gap-3 border-0 p-0',
        'disabled:opacity-60',
        className,
      )}
      {...rest}
    />
  )
}

export function FieldLegend({ className = '', ...rest }: FieldLegendProps) {
  return (
    <legend
      className={join('mb-1 text-[13px] font-extrabold text-ink-strong', className)}
      {...rest}
    />
  )
}
