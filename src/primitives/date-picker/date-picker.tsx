import { withDefaults } from '../../lib/withDefaults'
import { useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { Button } from '../button'
import { IconButton } from '../icon-button'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'
import type { DateRange, IsoDate } from '../date-field'
import type { DatePickerProps } from './types'
import { formatDate, parseDate } from './date-value'

export function DatePicker(props: DatePickerProps) {
  const {
    label,
    min,
    max,
    disabled = false,
    commitMode = 'immediate',
    className = '',
    displayLocale = 'en-US',
  } = props
  const labels = withDefaults(
    {
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      startDate: 'Start date',
      endDate: 'End date',
      apply: 'Apply',
      cancel: 'Cancel',
    },
    props.labels,
  )
  const readable = (value: IsoDate) =>
    parseDate(value)?.toLocaleDateString(displayLocale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  // An external value, mode or constraint change invalidates uncommitted edits.
  const key = JSON.stringify([props.mode, props.value, min, max, commitMode, disabled])
  const [draft, setDraft] = useState({ key, value: props.value })
  if (draft.key !== key) setDraft({ key, value: props.value })
  const value = commitMode === 'apply' && draft.key === key ? draft.value : props.value
  const single = typeof value === 'string' ? value : null
  const range: DateRange = value && typeof value === 'object' ? value : { from: null, to: null }
  const valid = (date: IsoDate) =>
    !!parseDate(date) && (!min || date! >= min) && (!max || date! <= max)
  const complete =
    props.mode === 'range'
      ? valid(range.from) && valid(range.to) && range.from! <= range.to!
      : valid(single)
  const commit = (next: IsoDate | DateRange) => {
    if (props.mode === 'range') {
      if (next && typeof next === 'object') props.onChange(next)
    } else if (typeof next === 'string' || next === null) props.onChange(next)
  }
  const change = (next: IsoDate | DateRange) => {
    if (disabled) return
    if (commitMode === 'apply') setDraft({ key, value: next })
    else commit(next)
  }
  const common = {
    inline: true as const,
    locale: props.locale,
    minDate: parseDate(min) ?? undefined,
    maxDate: parseDate(max) ?? undefined,
    disabled,
    filterDate: () => !disabled,
    calendarClassName: 'ui-date-picker-calendar',
    formatWeekDay: (day: string) => day.slice(0, 2),
    renderCustomHeader: ({
      date,
      decreaseMonth,
      increaseMonth,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled,
    }: {
      date: Date
      decreaseMonth: () => void
      increaseMonth: () => void
      prevMonthButtonDisabled: boolean
      nextMonthButtonDisabled: boolean
    }) => (
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-line pb-3">
        <IconButton
          shape="rounded"
          aria-label={labels.previousMonth}
          disabled={disabled || prevMonthButtonDisabled}
          onClick={decreaseMonth}
        >
          <ChevronLeftIcon />
        </IconButton>
        <span aria-live="polite" className="text-sm font-bold text-ink-strong">
          {date.toLocaleDateString(displayLocale, { month: 'long', year: 'numeric' })}
        </span>
        <IconButton
          shape="rounded"
          aria-label={labels.nextMonth}
          disabled={disabled || nextMonthButtonDisabled}
          onClick={increaseMonth}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
    ),
  }
  return (
    <div
      role="group"
      aria-label={label}
      aria-disabled={disabled}
      className={`ui-date-picker w-80 max-w-full rounded-surface border border-line bg-panel-solid p-4 text-ink shadow-sm shadow-(color:--shadow-soft) ${className}`}
    >
      {props.mode === 'range' && (
        <div
          className="mb-3 flex justify-between gap-2 border-b border-line pb-3 text-[13px]"
          aria-live="polite"
        >
          <span aria-label={labels.startDate}>{readable(range.from) ?? labels.startDate}</span>
          <span aria-hidden="true">→</span>
          <span aria-label={labels.endDate}>{readable(range.to) ?? labels.endDate}</span>
        </div>
      )}
      <fieldset disabled={disabled} className="m-0 min-w-0 border-0 p-0 disabled:opacity-40">
        <legend className="sr-only">{label}</legend>
        {props.mode === 'range' ? (
          <ReactDatePicker
            {...common}
            selectsRange
            startDate={parseDate(range.from)}
            endDate={parseDate(range.to)}
            selected={parseDate(range.from)}
            onChange={(dates) => change({ from: formatDate(dates[0]), to: formatDate(dates[1]) })}
          />
        ) : (
          <ReactDatePicker
            {...common}
            selected={parseDate(single)}
            onChange={(date: Date | null) => change(formatDate(date))}
          />
        )}
      </fieldset>
      {commitMode === 'apply' && (
        <div className="mt-4 flex gap-3 border-t border-line pt-4">
          <Button
            className="flex-1"
            disabled={disabled}
            onClick={() => {
              setDraft({ key, value: props.value })
              props.onCancel?.()
            }}
          >
            {labels.cancel}
          </Button>
          <Button
            className="flex-1"
            variant="primary"
            disabled={disabled || !complete}
            onClick={() => commit(value)}
          >
            {labels.apply}
          </Button>
        </div>
      )}
    </div>
  )
}
