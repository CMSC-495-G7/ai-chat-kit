import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react'

/** Where a step stands in a sequence. Drives the marker, not the open state. */
export type AccordionStepStatus = 'upcoming' | 'current' | 'complete'

type AccordionBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange' | 'dir'
> & {
  /** Disables every item. Individual items take `disabled` too. */
  disabled?: boolean
  /**
   * The heading level each trigger sits in. Pick the level that continues the
   * page's outline — a section under an `h2` wants `3`, the default.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /**
   * Draws the chat's reasoning rail: a node on each row, filled when open,
   * with a line running from it down the open item's content. Off by default
   * — a settings list reads better without it; a wizard reads better with it.
   * Step markers (`AccordionTrigger` `step`) become the rail's nodes.
   */
  rail?: boolean
  ref?: Ref<HTMLDivElement>
}

type AccordionSingleProps = {
  /** One panel open at a time, the default. Opening another closes the first. */
  type?: 'single'
  /** Controlled open item, or `null` for none. */
  value?: string | null
  /** Uncontrolled initial open item. */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /**
   * Whether the open panel can be closed by pressing its trigger again.
   * Defaults to `true`; pass `false` when exactly one section must stay
   * visible.
   */
  collapsible?: boolean
}

type AccordionMultipleProps = {
  /** Any number of panels open at once. */
  type: 'multiple'
  /** Controlled open items. */
  value?: string[]
  /** Uncontrolled initial open items. */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  collapsible?: never
}

export type AccordionProps = AccordionBaseProps & (AccordionSingleProps | AccordionMultipleProps)

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  /** Stable identity, matched against the root's `value`. */
  value: string
  /** Keeps the item visible and readable but not openable. */
  disabled?: boolean
  ref?: Ref<HTMLDivElement>
}

export type AccordionTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  /** Decorative leading glyph. The title still carries the meaning. */
  icon?: ReactNode
  /**
   * Beside the title — a `Pill` status, a count. Rendered inside the button,
   * so keep it non-interactive.
   */
  meta?: ReactNode
  /**
   * The section's current value, right-aligned while it is closed — "18
   * months", "Okta, required". Lets a reader scan a settings list without
   * opening anything; it fades out when the panel opens, since the panel
   * then says it in full.
   */
  summary?: ReactNode
  /** Numbers the item as a step and draws a marker. 1-based, as shown. */
  step?: number
  /**
   * The step's standing, shown on its marker: a check once `complete`,
   * emphasised while `current`. Only meaningful with `step`. Open state is
   * separate — a completed step can be reopened to edit.
   */
  status?: AccordionStepStatus
  /** Accessible step prefix, including any status. Default English step/status wording. */
  stepLabel?: (step: number, status: AccordionStepStatus) => string
  ref?: Ref<HTMLButtonElement>
}

export type AccordionContentProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
}
