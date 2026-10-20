import { createContext, useContext } from 'react'
import type { RadioGroupItemProps, RadioGroupProps } from './types'

type RadioContextValue = Pick<
  RadioGroupProps,
  'name' | 'value' | 'defaultValue' | 'onValueChange' | 'disabled'
>

const RadioContext = createContext<RadioContextValue | null>(null)

export function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  className = '',
  children,
  ...rest
}: RadioGroupProps) {
  return (
    <RadioContext.Provider value={{ name, value, defaultValue, onValueChange, disabled }}>
      <div
        role="radiogroup"
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        className={[
          'flex min-w-0',
          orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2.5',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </div>
    </RadioContext.Provider>
  )
}

export function RadioGroupItem({
  value,
  disabled = false,
  className = '',
  ref,
  ...rest
}: RadioGroupItemProps) {
  const group = useContext(RadioContext)
  if (!group) throw new Error('RadioGroupItem must be rendered inside RadioGroup')

  const controlled = group.value !== undefined
  return (
    <input
      {...rest}
      ref={ref}
      type="radio"
      name={group.name}
      value={value}
      checked={controlled ? group.value === value : undefined}
      defaultChecked={!controlled ? group.defaultValue === value : undefined}
      disabled={group.disabled || disabled}
      className={[
        'size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-ink-soft/60 bg-panel-solid transition',
        'hover:border-brand-fg/70 checked:border-[5px] checked:border-brand-solid',
        'focus-visible:ring-3 focus-visible:ring-accent/20',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onChange={(event) => {
        if (event.currentTarget.checked) group.onValueChange?.(value)
      }}
    />
  )
}
