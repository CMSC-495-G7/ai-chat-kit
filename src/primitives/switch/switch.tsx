import { useId } from 'react'
import type { SwitchProps } from './types'

/**
 * A boolean that takes effect immediately.
 *
 * `role="switch"` rather than a checkbox, and the distinction is not
 * cosmetic: a checkbox is a value you are *staging* for a later submit, a
 * switch is a setting that applies the moment you touch it. Screen readers
 * announce them differently ("on/off" vs "checked/unchecked"), and a filter
 * that applies instantly is the second thing.
 *
 * Built on a real `<button>`, so Space and Enter both work and the global
 * `:focus-visible` outline applies without anything extra.
 */
export function Switch({
  label,
  hideLabel = false,
  checked,
  onChange,
  description,
  disabled = false,
  className = '',
  id,
}: SwitchProps) {
  const auto = useId()
  const labelId = `${id ?? auto}-label`

  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition',
          'disabled:pointer-events-none disabled:opacity-40',
          checked ? 'bg-brand-solid' : 'bg-ink-soft/30',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'inline-block size-3.5 rounded-full bg-panel-solid shadow-sm transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          ].join(' ')}
        />
      </button>

      <span id={labelId} className={hideLabel ? 'sr-only' : 'flex min-w-0 flex-col gap-0.5'}>
        <span className="text-[13px] text-ink">{label}</span>
        {description && !hideLabel && (
          <span className="text-[11.5px] text-ink-soft">{description}</span>
        )}
      </span>
    </div>
  )
}
