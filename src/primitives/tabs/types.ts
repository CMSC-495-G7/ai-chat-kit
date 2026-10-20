import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react'

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsActivationMode = 'automatic' | 'manual'
/**
 * `line` (default) underlines the selected tab with a rounded brand bar;
 * `segmented` raises it out of a tinted track, for switching views of one
 * thing. `contained` is the old name for `segmented`.
 */
export type TabsListVariant =
  | 'line'
  | 'segmented'
  | 'unstyled'
  /** @deprecated Use `segmented`. */
  | 'contained'

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> & {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Selecting the active trigger again clears the value. */
  allowDeselect?: boolean
  orientation?: TabsOrientation
  activationMode?: TabsActivationMode
  children: ReactNode
}

export type TabsListProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TabsListVariant
  ref?: Ref<HTMLDivElement>
}

export type TabsTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  value: string
  /** A leading glyph, sized by the caller (15–16px). Decorative: the label names the tab. */
  icon?: ReactNode
  /** A trailing count ("128"), in a pill that takes the selected tab's colour. */
  count?: ReactNode
  /** Override the controlled panel id, or disable aria-controls for externally rendered panels. */
  controls?: string | false
}

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string
}
