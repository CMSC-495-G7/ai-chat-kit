import { useId } from 'react'
import { CheckIcon } from '../icons'
import type { ChoiceCardProps } from './types'

/**
 * A controlled native radio or checkbox with the whole card as its hit target.
 *
 * The input remains in the DOM and fills the card, so browser forms, required
 * validation, radio arrow-key behavior, screen readers and refs keep working.
 * Everything after it is presentation driven by `peer-*` states.
 */
export function ChoiceCard({
  type,
  name,
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
  ref,
  ...rest
}: ChoiceCardProps) {
  const auto = useId()
  const labelId = `${auto}-label`
  const descriptionId = `${auto}-description`
  const describedBy = [rest['aria-describedby'], description ? descriptionId : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <label
      className={[
        'relative flex min-h-40 min-w-48 cursor-pointer overflow-hidden rounded-surface',
        disabled ? 'cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        {...rest}
        ref={ref}
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-labelledby={rest['aria-labelledby'] ?? labelId}
        aria-describedby={describedBy || undefined}
        className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
      />

      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-0 rounded-surface border border-line bg-panel-solid transition',
          'peer-hover:border-brand-fg/45 peer-hover:bg-tint/4',
          'peer-checked:border-brand-fg/55 peer-checked:bg-chip',
          'peer-focus-visible:ring-3 peer-focus-visible:ring-accent/20',
          'peer-aria-invalid:border-danger',
          'peer-disabled:opacity-40',
        ].join(' ')}
      />

      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute top-4 right-4 z-20 inline-grid size-[18px] place-items-center transition',
          type === 'radio'
            ? 'rounded-full border-2 border-ink-soft/45 bg-panel-solid after:size-1.5 after:rounded-full after:bg-on-brand-solid after:opacity-0 peer-checked:border-brand-solid peer-checked:bg-brand-solid peer-checked:after:opacity-100'
            : 'rounded-check border-2 border-ink-soft/45 bg-panel-solid text-transparent peer-checked:border-brand-solid peer-checked:bg-brand-solid peer-checked:text-on-brand-solid',
          'peer-aria-invalid:border-danger peer-disabled:opacity-40',
        ].join(' ')}
      >
        {type === 'checkbox' && <CheckIcon width={12} height={12} strokeWidth={2.5} />}
      </span>

      <span className="pointer-events-none relative flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 px-6 py-8 text-center peer-disabled:opacity-40">
        {icon && (
          <span
            aria-hidden="true"
            className={`inline-grid size-12 place-items-center transition-colors [&>svg]:size-full ${checked ? 'text-brand-fg' : 'text-ink-soft'}`}
          >
            {icon}
          </span>
        )}
        <span className="flex min-w-0 flex-col items-center gap-1">
          <span
            id={labelId}
            className={`text-[15px] font-extrabold ${checked ? 'text-brand-fg' : 'text-ink-strong'}`}
          >
            {label}
          </span>
          {description && (
            <span id={descriptionId} className="text-[12px] leading-relaxed text-ink-soft">
              {description}
            </span>
          )}
        </span>
      </span>
    </label>
  )
}
