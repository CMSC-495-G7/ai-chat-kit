import type { SegmentedControlProps } from './types'
export function SegmentedControl({
  label,
  value,
  options,
  onValueChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex shrink-0 rounded-control border border-line bg-tint/5 p-[3px] ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          onClick={() => onValueChange(option.value)}
          aria-pressed={value === option.value}
          className={`h-[30px] rounded-control px-4 text-[13px] transition disabled:opacity-40 ${value === option.value ? 'bg-panel-solid font-bold text-accent-fg shadow-sm' : 'font-semibold text-ink-soft hover:text-ink-strong'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
