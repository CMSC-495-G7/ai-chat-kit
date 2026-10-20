import { ChevronDownIcon } from '../icons'
import type { SelectProps, SelectSize } from './types'

const boxes: Record<SelectSize, string> = {
  sm: 'h-8 pl-2.5 pr-7 text-[12.5px]',
  md: 'h-9 pl-3 pr-8 text-[13px]',
}

/**
 * A native `<select>` with the platform arrow replaced.
 *
 * Native for the same reason `Checkbox` is: the popup a real select opens is
 * the one the platform already made keyboard-, touch- and screen-reader-
 * correct, and on a phone it is a wheel rather than a cramped menu. A listbox
 * built from divs is a genuine project, not a styling choice — reach for one
 * only when the options need rich content, and then it is a different
 * component, not a prop on this one.
 *
 * The primitive is intentionally label-agnostic. A form composes it with
 * `FieldLabel`; compact toolbars give it an `aria-label` or
 * `aria-labelledby`. This keeps visible form structure outside the control
 * without giving up the platform select's accessible popup.
 */
export function Select({
  size = 'md',
  options,
  children,
  className = '',
  ref,
  ...rest
}: SelectProps) {
  const invalid = rest['aria-invalid'] === true || rest['aria-invalid'] === 'true'

  return (
    <span className={['relative inline-flex items-center', className].filter(Boolean).join(' ')}>
      <select
        ref={ref}
        className={[
          'w-full appearance-none rounded-control border bg-panel-solid text-ink outline-none transition',
          'hover:bg-tint/5 disabled:pointer-events-none disabled:opacity-40',
          invalid
            ? 'border-danger focus-visible:ring-3 focus-visible:ring-danger/15'
            : 'border-line focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
          boxes[size],
        ].join(' ')}
        {...rest}
      >
        {options?.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDownIcon
        width={12}
        height={12}
        className="pointer-events-none absolute right-2.5 text-ink-soft"
      />
    </span>
  )
}
