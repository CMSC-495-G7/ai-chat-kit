import type { DatePickerProps as ReactDatePickerProps } from 'react-datepicker'
import type { DateRange, IsoDate } from '../date-field'

export type DatePickerLabels = {
  previousMonth: string
  nextMonth: string
  startDate: string
  endDate: string
  apply: string
  cancel: string
}

type Shared = {
  labels?: Partial<DatePickerLabels>
  /** Calendar locale object, or a locale registered with react-datepicker. */
  locale?: ReactDatePickerProps['locale']
  /** Intl locale for the month and selected-date headings. Default en-US. */
  displayLocale?: string | string[]
  /** Accessible calendar name. */
  label: string
  /** Earliest selectable date, YYYY-MM-DD inclusive. */
  min?: string
  /** Latest selectable date, YYYY-MM-DD inclusive. */
  max?: string
  /** Disables navigation, selection and footer actions. */
  disabled?: boolean
  /** Additional classes on the outer surface. */
  className?: string
  /** Immediate by default. Apply keeps edits local until a complete selection is confirmed. */
  commitMode?: 'immediate' | 'apply'
  /** Called after discarding draft edits in apply mode. */
  onCancel?: () => void
}

/** Calendar-only control. DateField remains the native text-entry alternative. */
export type DatePickerProps = Shared &
  (
    | {
        /** Single date selection, the default. */
        mode?: 'single'
        /** Controlled local date, YYYY-MM-DD, or null. */
        value: IsoDate
        /** Commits immediately or when Apply is pressed. */
        onChange: (value: IsoDate) => void
      }
    | {
        /** Start/end date selection. */
        mode: 'range'
        /** Controlled from/to pair; immediate mode supports partial ranges. */
        value: DateRange
        /** Commits immediately or when a complete range is applied. */
        onChange: (value: DateRange) => void
      }
  )
