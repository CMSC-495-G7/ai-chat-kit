import { withDefaults } from '../../lib/withDefaults'
import { useCallback, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IconButton } from '../icon-button'
import { CalendarIcon, CircleXIcon } from '../icons'
import { DatePopover, LazyDatePicker, PresetList } from './date-popover'
import {
  dateRangePresets,
  datePresets,
  daysBetween,
  formatDisplay,
  formatRange,
  parseTyped,
} from './date-text'
import type { DateFieldProps, DateRange, DateRangeFieldProps } from './types'

/** The shell every date field draws: TextInput's box, plus an open state. */
function shell(open: boolean, invalid: boolean, disabled: boolean) {
  return [
    'flex h-9 min-w-0 items-center gap-2 rounded-control border bg-panel-solid pr-1 pl-3 text-[13px] transition',
    invalid
      ? 'border-danger focus-within:ring-3 focus-within:ring-danger/15'
      : open
        ? 'border-accent ring-3 ring-accent/20'
        : 'border-line hover:border-ink-soft/40 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20',
    disabled ? 'pointer-events-none opacity-40' : '',
  ].join(' ')
}

function FieldLabel({
  id,
  htmlFor,
  visible,
  children,
}: {
  id: string
  htmlFor?: string
  visible: boolean
  children: ReactNode
}) {
  const cls = visible ? 'text-[12px] font-bold text-ink-soft' : 'sr-only'
  return htmlFor ? (
    <label id={id} htmlFor={htmlFor} className={cls}>
      {children}
    </label>
  ) : (
    <span id={id} className={cls}>
      {children}
    </span>
  )
}

function ErrorLine({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} className="flex items-start gap-1.5 text-[12px] font-semibold text-danger-fg">
      <CircleXIcon width={14} height={14} className="mt-px shrink-0" />
      {children}
    </span>
  )
}

const presetChip =
  'inline-flex h-[22px] shrink-0 items-center rounded-full bg-chip px-2 text-[12px] font-extrabold text-chip-fg'

/**
 * One date. Type it ("Sep 30, 2026", "9/30/2026", "2026-09-30") or open the
 * branded calendar — the same `DatePicker`, in a popover — from the button or
 * with Alt+↓. The field shows the value as people read it and hands back ISO.
 *
 * `presets` swaps typing for quick picks: the field then shows the matching
 * pick as a chip ("End of month") beside the date, which fits a narrow rail.
 */
export function DateField({
  label,
  showLabel = false,
  value,
  onChange,
  min,
  max,
  disabled = false,
  error,
  placeholder,
  presets,
  className = '',
  id,
  labels: overrides,
  calendarProps,
  formatValue = formatDisplay,
  parseValue = parseTyped,
}: DateFieldProps) {
  const labels = withDefaults(
    {
      openCalendar: 'Open calendar',
      closeCalendar: 'Close calendar',
      quickPicks: 'Quick picks',
      pickDate: 'Pick a date',
      typedDate: 'Mon DD, YYYY',
      dateRange: 'Start – end date',
      days: (n: number) => `${n} days`,
    },
    overrides,
  )
  const auto = useId()
  const inputId = id ?? auto
  const labelId = `${inputId}-label`
  const valueId = `${inputId}-value`
  const errorId = `${inputId}-error`
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
  const focusRef = useRef<HTMLInputElement | HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const list = presets === true ? datePresets() : presets || null
  const active = list?.find((p) => p.value === value)?.label
  const message = parseError ?? error
  const close = useCallback((refocus: boolean) => {
    setOpen(false)
    if (refocus) focusRef.current?.focus()
  }, [])
  const pick = (next: string | null) => {
    setDraft(null)
    setParseError(null)
    if (next !== value) onChange(next)
    close(true)
  }
  const commit = () => {
    if (draft === null) return
    const result = parseValue(draft, min, max)
    if (result.error !== undefined) return setParseError(result.error)
    setParseError(null)
    setDraft(null)
    if (result.value !== value) onChange(result.value)
  }

  return (
    <span className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <FieldLabel id={labelId} htmlFor={list ? undefined : inputId} visible={showLabel}>
        {label}
      </FieldLabel>
      <div ref={setAnchor} className={shell(open, !!message, disabled)}>
        {list ? (
          <button
            ref={(el) => {
              focusRef.current = el
            }}
            id={inputId}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-labelledby={`${labelId} ${valueId}`}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
            onClick={() => setOpen((o) => !o)}
            className="flex h-full min-w-0 grow items-center gap-2 text-left outline-none"
          >
            <span id={valueId} className="flex min-w-0 items-center gap-2">
              {active && <span className={presetChip}>{active}</span>}
              <span
                className={`truncate ${value ? (active ? 'text-ink-soft' : 'text-ink') : 'text-ink-soft'}`}
              >
                {value ? formatValue(value) : (placeholder ?? labels.pickDate)}
              </span>
            </span>
          </button>
        ) : (
          <input
            ref={(el) => {
              focusRef.current = el
            }}
            id={inputId}
            type="text"
            inputMode="text"
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder ?? labels.typedDate}
            value={draft ?? formatValue(value)}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
            onChange={(e) => {
              setDraft(e.target.value)
              if (parseError) setParseError(null)
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              else if (e.key === 'Escape' && draft !== null) {
                setDraft(null)
                setParseError(null)
              } else if (e.key === 'ArrowDown' && e.altKey) {
                e.preventDefault()
                setOpen(true)
              }
            }}
            className="min-w-0 grow bg-transparent text-ink outline-none placeholder:text-ink-soft"
          />
        )}
        <IconButton
          size="sm"
          shape="rounded"
          aria-label={open ? labels.closeCalendar : labels.openCalendar}
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          active={open}
          tabIndex={list ? -1 : undefined}
          onClick={() => setOpen((o) => !o)}
          className="size-7!"
        >
          <CalendarIcon width={16} height={16} />
        </IconButton>
      </div>
      {message && <ErrorLine id={errorId}>{message}</ErrorLine>}
      <DatePopover
        anchor={anchor}
        open={open}
        label={label}
        onClose={close}
        aside={
          list && (
            <PresetList label={labels.quickPicks} presets={list} active={active} onPick={pick} />
          )
        }
      >
        <LazyDatePicker
          {...calendarProps}
          label={label}
          value={value}
          onChange={pick}
          min={min}
          max={max}
          className="rounded-none! border-0! shadow-none!"
        />
      </DatePopover>
    </span>
  )
}

/**
 * Two dates that bound each other, chosen in one calendar: the first click
 * sets the start, the second the end, and Apply commits both — an impossible
 * range is never entered, so there is no error to write for one.
 *
 * The field reads "Sep 6 – Sep 15, 2026 · 10 days". With `presets` it leads
 * with the matching pick ("Last 30 days"), and the calendar opens with the
 * picks alongside — one click for the ranges people actually ask for.
 */
export function DateRangeField({
  label,
  showLabel = true,
  value,
  onChange,
  min,
  max,
  disabled = false,
  error,
  placeholder,
  presets,
  className = '',
  id,
  labels: overrides,
  calendarProps,
  formatValue = formatRange,
  showDayCount = true,
}: DateRangeFieldProps) {
  const labels = withDefaults(
    {
      openCalendar: 'Open calendar',
      closeCalendar: 'Close calendar',
      quickPicks: 'Quick picks',
      pickDate: 'Pick a date',
      typedDate: 'Mon DD, YYYY',
      dateRange: 'Start – end date',
      days: (n: number) => `${n} days`,
    },
    overrides,
  )
  const auto = useId()
  const fieldId = id ?? auto
  const labelId = `${fieldId}-label`
  const valueId = `${fieldId}-value`
  const errorId = `${fieldId}-error`
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const list = presets === true ? dateRangePresets() : presets || null
  const active = list?.find((p) => p.value.from === value.from && p.value.to === value.to)?.label
  const complete = !!value.from && !!value.to
  const close = useCallback((refocus: boolean) => {
    setOpen(false)
    if (refocus) trigger.current?.focus()
  }, [])
  const pick = (next: DateRange) => {
    onChange(next)
    close(true)
  }

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <FieldLabel id={labelId} visible={showLabel}>
        {label}
      </FieldLabel>
      <div ref={setAnchor} className={shell(open, !!error, disabled)}>
        <button
          ref={trigger}
          id={fieldId}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && e.altKey) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className="flex h-full min-w-0 grow items-center gap-2 text-left outline-none"
        >
          <span id={valueId} className="flex min-w-0 items-center gap-2">
            {active && <span className={presetChip}>{active}</span>}
            <span
              className={`truncate ${value.from ? (active ? 'text-ink-soft' : 'text-ink') : 'text-ink-soft'}`}
            >
              {value.from ? formatValue(value) : (placeholder ?? labels.dateRange)}
            </span>
            {showDayCount && complete && !active && (
              <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-line bg-tint/5 px-2 text-[11px] font-bold text-ink-soft">
                {labels.days(daysBetween(value.from!, value.to!))}
              </span>
            )}
          </span>
        </button>
        <IconButton
          size="sm"
          shape="rounded"
          aria-label={open ? labels.closeCalendar : labels.openCalendar}
          disabled={disabled}
          active={open}
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          className="size-7!"
        >
          <CalendarIcon width={16} height={16} />
        </IconButton>
      </div>
      {error && <ErrorLine id={errorId}>{error}</ErrorLine>}
      <DatePopover
        anchor={anchor}
        open={open}
        label={label}
        onClose={close}
        aside={
          list && (
            <PresetList label={labels.quickPicks} presets={list} active={active} onPick={pick} />
          )
        }
      >
        <LazyDatePicker
          {...calendarProps}
          mode="range"
          label={label}
          value={value}
          onChange={pick}
          min={min}
          max={max}
          commitMode="apply"
          onCancel={() => close(true)}
          className="rounded-none! border-0! shadow-none!"
        />
      </DatePopover>
    </div>
  )
}
