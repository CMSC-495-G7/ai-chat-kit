import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { SliderProps } from './types'

type SliderStyle = CSSProperties & { '--slider-progress': string }

export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue = String,
  className = '',
  disabled = false,
  style,
  id,
  ref,
  ...rest
}: SliderProps) {
  const minimum = Number(min)
  const maximum = Number(max)
  const initial = defaultValue ?? minimum
  const [localValue, setLocalValue] = useState(initial)
  const displayed = value ?? localValue
  const span = maximum - minimum
  const progress = span > 0 ? Math.min(100, Math.max(0, ((displayed - minimum) / span) * 100)) : 0
  const sliderStyle = { ...style, '--slider-progress': `${progress}%` } as SliderStyle

  return (
    <span
      className={['inline-flex min-w-0 flex-col gap-1.5', disabled ? 'opacity-40' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        {...rest}
        id={id}
        ref={ref}
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        defaultValue={value === undefined ? initial : undefined}
        disabled={disabled}
        style={sliderStyle}
        className="ui-slider w-full disabled:pointer-events-none"
        onChange={(event) => {
          const next = event.currentTarget.valueAsNumber
          if (value === undefined) setLocalValue(next)
          onValueChange?.(next)
        }}
      />
      {showValue && (
        <output htmlFor={id} aria-hidden="true" className="text-[11.5px] font-bold text-ink-soft">
          {formatValue(displayed)}
        </output>
      )}
    </span>
  )
}
