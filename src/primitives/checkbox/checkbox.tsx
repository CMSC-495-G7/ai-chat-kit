import { CheckIcon, MinusIcon } from '../icons'
import type { CheckboxProps } from './types'

/**
 * A native checkbox with a branded visual shell.
 *
 * The transparent input still owns focus, the space key, form participation
 * and screen-reader state. Its sibling is only the drawing: a heavier rounded
 * outline at rest and the active theme's brand fill when selected.
 *
 * `indeterminate` is the one thing HTML will not let us set declaratively, so
 * the callback ref below is load-bearing rather than a workaround: React never
 * writes that property from JSX.
 */
export function Checkbox({
  indeterminate = false,
  label,
  meta,
  className = '',
  ref,
  ...rest
}: CheckboxProps) {
  const box = (
    <span
      className={['relative inline-grid size-6 shrink-0 place-items-center', label ? '' : className]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        {...rest}
        type="checkbox"
        ref={(node) => {
          if (node) node.indeterminate = indeterminate
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        aria-checked={indeterminate ? 'mixed' : undefined}
        checked={indeterminate ? false : rest.checked}
        className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className={[
          'pointer-events-none size-[18px] rounded-check border-2 border-ink-soft/60 bg-panel-solid transition',
          'peer-hover:border-brand-fg/70',
          'peer-checked:border-brand-solid peer-checked:bg-brand-solid',
          'peer-[:indeterminate]:border-brand-solid peer-[:indeterminate]:bg-brand-solid',
          'peer-aria-invalid:border-danger',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)]',
          'peer-disabled:opacity-40',
        ].join(' ')}
      />
      <CheckIcon
        aria-hidden
        width={13}
        height={13}
        strokeWidth={2.5}
        className="pointer-events-none absolute text-on-brand-solid opacity-0 transition-opacity peer-checked:opacity-100 peer-[:indeterminate]:opacity-0 peer-disabled:opacity-40"
      />
      <MinusIcon
        aria-hidden
        width={12}
        height={12}
        strokeWidth={2.5}
        className="pointer-events-none absolute text-on-brand-solid opacity-0 transition-opacity peer-[:indeterminate]:opacity-100 peer-disabled:opacity-40"
      />
    </span>
  )

  if (!label) return box

  return (
    <label
      className={['flex cursor-pointer items-center gap-2.5 text-[13px] text-ink', className]
        .filter(Boolean)
        .join(' ')}
    >
      {box}
      <span className="grow">{label}</span>
      {meta != null && (
        <span className="shrink-0 text-[11.5px] font-bold text-ink-soft tabular-nums">{meta}</span>
      )}
    </label>
  )
}
