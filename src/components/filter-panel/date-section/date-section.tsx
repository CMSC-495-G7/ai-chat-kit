import { useId } from 'react'
import { DateRangeField } from '../../../primitives/date-field'
import { ChevronDownIcon } from '../../../primitives/icons'
import { describeRange, hasRange, presetsOf, sameRange } from '../dateFilter'
import type { DateRangeFilterField } from '../types'
import type { DateSectionProps } from './types'

const toggle =
  'inline-flex h-8 min-w-0 items-center justify-center rounded-control border px-2 text-[12.5px] font-bold transition'

/** The picks and the exact range for one date. */
function DateBody({ field }: { field: DateRangeFilterField }) {
  const presets = presetsOf(field)
  return (
    <div className="flex flex-col gap-2.5">
      {presets.length > 0 && (
        <div
          role="group"
          aria-label={`${field.label} presets`}
          className="grid grid-cols-2 gap-1.5"
        >
          {presets.map((preset) => {
            const on = hasRange(field.value) && sameRange(preset.value, field.value)
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={on}
                onClick={() => field.onChange(on ? { from: null, to: null } : preset.value)}
                className={`${toggle} ${
                  on
                    ? 'border-accent/50 bg-chip text-chip-fg'
                    : 'border-line bg-panel-solid text-ink hover:border-accent/40'
                }`}
              >
                <span className="truncate">{preset.label}</span>
              </button>
            )
          })}
        </div>
      )}
      <DateRangeField
        label={field.label}
        showLabel={false}
        // The day count repeats what the pressed preset already says, and in a narrow
        // rail it is what pushes the dates into an ellipsis.
        showDayCount={false}
        value={field.value}
        min={field.min}
        max={field.max}
        onChange={field.onChange}
      />
      {field.hint && <span className="text-[11.5px] text-ink-soft">{field.hint}</span>}
    </div>
  )
}

/**
 * The panel's dates. One date field is drawn open, like any other field. Two or
 * more share a "Dates" heading and fold into rows, one open at a time, each
 * saying what it is set to — so "Last 30 days" is never a preset of an unknown
 * date, and three dates do not make the panel three screens tall.
 */
export function DateSection({ fields, labels, expanded, onExpandedChange }: DateSectionProps) {
  const base = useId()
  if (fields.length === 1) {
    const [field] = fields
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-extrabold text-ink-strong">{field.label}</span>
        <DateBody field={field} />
      </div>
    )
  }
  return (
    <div role="group" aria-labelledby={`${base}-heading`} className="flex flex-col gap-1.5">
      <span id={`${base}-heading`} className="text-[12.5px] font-extrabold text-ink-strong">
        {labels.dates}
      </span>
      {fields.map((field) => {
        const open = field.id === expanded
        const set = hasRange(field.value)
        return (
          <div
            key={field.id}
            className={`overflow-hidden rounded-surface border bg-panel-solid ${
              open ? 'border-accent/40' : 'border-line'
            }`}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`${base}-${field.id}`}
              onClick={() => onExpandedChange(field.id)}
              className="flex min-h-10 w-full items-center gap-2 px-3 text-left transition hover:bg-tint/5"
            >
              <span className="grow truncate text-[13px] font-bold text-ink-strong">
                {field.label}
              </span>
              <span
                className={`max-w-[55%] shrink-0 truncate text-[12.5px] tabular-nums ${
                  set ? 'font-bold text-accent-fg' : 'font-semibold text-ink-soft'
                }`}
              >
                {describeRange(field, labels.anyTime)}
              </span>
              <ChevronDownIcon
                width={13}
                height={13}
                className={`shrink-0 text-ink-soft transition ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <div id={`${base}-${field.id}`} className="border-t border-line px-3 pt-3 pb-3.5">
                <DateBody field={field} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
