import type { ReactNode, Ref } from 'react'

export type SelectSize = 'sm' | 'md'

export type SelectValue = string | number

export type SelectOption = {
  value: SelectValue
  label: ReactNode
  disabled?: boolean
  /**
   * Options sharing a group sit together under its name, in the order the
   * groups first appear.
   */
  group?: string
  /** What type-ahead matches when `label` is not plain text. */
  textValue?: string
}

/** Something to do instead of choosing — "New client", "Import clients". */
export type SelectAction = {
  label: ReactNode
  /** Defaults to a plus. `null` for none. */
  icon?: ReactNode
  onSelect: () => void
  disabled?: boolean
}

type Labelled =
  | {
      /**
       * A visible label above the box. Leave it out to label the select from
       * outside — `FieldLabel` with `htmlFor`, `aria-label` or
       * `aria-labelledby`.
       */
      label: ReactNode
      /** A link button at the end of the label's line. Needs `label`. */
      action?: SelectAction
    }
  | { label?: undefined; action?: never }

export type SelectProps = Labelled & {
  options: SelectOption[]
  /** Controlled value. `null` shows the placeholder. */
  value?: SelectValue | null
  defaultValue?: SelectValue | null
  /** Called with the chosen option's own value, number or string. */
  onChange?: (value: SelectValue) => void
  /** Shown in the box while nothing is chosen. */
  placeholder?: ReactNode
  /** The last row of the open list, under a rule. */
  listAction?: SelectAction
  /** Shown in the open list when there are no options. */
  emptyLabel?: ReactNode
  size?: SelectSize
  disabled?: boolean
  /** Submits the value with a surrounding form, through a hidden input. */
  name?: string
  required?: boolean
  id?: string
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  ref?: Ref<HTMLButtonElement>
}
