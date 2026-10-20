import { createContext, useContext, useId, useRef, useState } from 'react'
import type { KeyboardEvent, Ref, RefObject } from 'react'
import { CheckIcon, ChevronDownIcon } from '../icons'
import { useUiSize } from '../../lib/uiSize'
import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
} from './types'

type AccordionContextValue = {
  openValues: string[]
  toggle: (value: string) => void
  disabled: boolean
  rail: boolean
  headingLevel: 2 | 3 | 4 | 5 | 6
  root: RefObject<HTMLDivElement | null>
}

type ItemContextValue = {
  value: string
  open: boolean
  disabled: boolean
  triggerId: string
  contentId: string
}

const AccordionContext = createContext<AccordionContextValue | null>(null)
const ItemContext = createContext<ItemContextValue | null>(null)

function useAccordion(part: string) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error(`${part} must be used inside Accordion`)
  return context
}

function useItem(part: string) {
  const context = useContext(ItemContext)
  if (!context) throw new Error(`${part} must be used inside AccordionItem`)
  return context
}

/** Both the caller's ref and ours: the root is also the keyboard scope. */
function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as RefObject<T | null>).current = node
    }
  }
}

const toArray = (value: string | string[] | null | undefined) =>
  Array.isArray(value) ? value : value == null ? [] : [value]

/**
 * Stacked sections that each show or hide their own content — the compound
 * shape shadcn/Radix use: `Accordion` › `AccordionItem` › `AccordionTrigger`
 * + `AccordionContent`. Controlled or uncontrolled, one open or many.
 *
 * The look is the "parting list": closed items are one joined list, each row
 * showing its current value; opening one lifts it out as a raised card and the
 * list parts around it. `rail` adds the chat's reasoning rail. The layout
 * lives in accordion.css, because the parting depends on each item's
 * neighbours — not something utilities on one element can say.
 *
 * The motion is ThinkingBlock's: a grid-row transition to the content's real
 * height, no measuring. Closed panels are `inert`.
 */
export function Accordion(props: AccordionProps) {
  const {
    type = 'single',
    value: controlledValue,
    defaultValue,
    onValueChange,
    collapsible = true,
    disabled = false,
    rail = false,
    headingLevel = 3,
    className = '',
    children,
    ref,
    ...rest
  } = props as AccordionProps & { collapsible?: boolean }
  const compact = useUiSize() === 'compact'
  const root = useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = useState(() => toArray(defaultValue))
  const controlled = controlledValue !== undefined
  const openValues = controlled ? toArray(controlledValue) : uncontrolled

  const toggle = (value: string) => {
    const isOpen = openValues.includes(value)
    let next: string[]
    if (type === 'multiple') {
      next = isOpen ? openValues.filter((v) => v !== value) : [...openValues, value]
    } else {
      if (isOpen && !collapsible) return
      next = isOpen ? [] : [value]
    }
    if (!controlled) setUncontrolled(next)
    if (type === 'multiple') (onValueChange as ((v: string[]) => void) | undefined)?.(next)
    else (onValueChange as ((v: string | null) => void) | undefined)?.(next[0] ?? null)
  }

  return (
    <AccordionContext.Provider value={{ openValues, toggle, disabled, rail, headingLevel, root }}>
      <div
        {...rest}
        ref={mergeRefs(ref, root)}
        data-rail={rail || undefined}
        data-density={compact ? 'compact' : undefined}
        className={`ui-accordion ${className}`}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

/** One section. Owns its identity and ids; the root owns whether it is open. */
export function AccordionItem({
  value,
  disabled: itemDisabled = false,
  className = '',
  children,
  ...rest
}: AccordionItemProps) {
  const accordion = useAccordion('AccordionItem')
  const id = useId()
  const open = accordion.openValues.includes(value)
  const disabled = accordion.disabled || itemDisabled

  return (
    <ItemContext.Provider
      value={{ value, open, disabled, triggerId: `${id}-trigger`, contentId: `${id}-content` }}
    >
      <div
        {...rest}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        className={`ui-accordion__item ${className}`}
      >
        {children}
      </div>
    </ItemContext.Provider>
  )
}

/** Arrow keys walk the triggers of this accordion only — not a nested one. */
function moveFocus(event: KeyboardEvent<HTMLButtonElement>, root: HTMLDivElement | null) {
  if (!root || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const triggers = Array.from(
    root.querySelectorAll<HTMLButtonElement>('.ui-accordion__trigger:not(:disabled)'),
  ).filter((el) => el.closest('.ui-accordion') === root)
  if (!triggers.length) return
  event.preventDefault()
  const current = triggers.indexOf(event.currentTarget)
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? triggers.length - 1
        : event.key === 'ArrowUp'
          ? (current - 1 + triggers.length) % triggers.length
          : (current + 1) % triggers.length
  triggers[index]?.focus()
}

const STATUS_LABEL = { upcoming: '', current: ', current', complete: ', done' } as const

/**
 * The header row: a native button inside a heading, so section titles stay in
 * the document outline and screen-reader heading navigation.
 */
export function AccordionTrigger({
  icon,
  meta,
  summary,
  step,
  status = 'upcoming',
  stepLabel = (step, status) => `Step ${step}${STATUS_LABEL[status]}: `,
  className = '',
  children,
  onClick,
  onKeyDown,
  ...rest
}: AccordionTriggerProps) {
  const accordion = useAccordion('AccordionTrigger')
  const item = useItem('AccordionTrigger')
  const Heading = `h${accordion.headingLevel}` as const
  const stepped = step !== undefined

  return (
    <Heading className="ui-accordion__heading">
      <button
        {...rest}
        type="button"
        id={item.triggerId}
        aria-expanded={item.open}
        aria-controls={item.contentId}
        disabled={item.disabled}
        data-status={stepped ? status : undefined}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) accordion.toggle(item.value)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented) moveFocus(event, accordion.root.current)
        }}
        className={`ui-accordion__trigger ${className}`}
      >
        {stepped ? (
          <>
            <span aria-hidden="true" className="ui-accordion__marker">
              {status === 'complete' ? <CheckIcon width={12} height={12} strokeWidth={3} /> : step}
            </span>
            <span className="sr-only">{stepLabel(step!, status)}</span>
          </>
        ) : (
          accordion.rail && <span aria-hidden="true" className="ui-accordion__node" />
        )}
        {icon && (
          <span aria-hidden="true" className="ui-accordion__icon">
            {icon}
          </span>
        )}
        <span className="ui-accordion__titlewrap">
          <span className="ui-accordion__title">{children}</span>
          {meta}
        </span>
        {summary != null && <span className="ui-accordion__summary">{summary}</span>}
        <ChevronDownIcon
          width={16}
          height={16}
          strokeWidth={2.2}
          className="ui-accordion__chevron"
        />
      </button>
    </Heading>
  )
}

/**
 * The panel. Always mounted, so it animates both ways and keeps its state (a
 * half-typed field survives closing); `inert` while closed takes it out of the
 * tab order and the accessibility tree.
 */
export function AccordionContent({ className = '', children, ...rest }: AccordionContentProps) {
  const item = useItem('AccordionContent')

  return (
    <div
      {...rest}
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      inert={!item.open}
      className="ui-accordion__panel"
    >
      <div className="ui-accordion__panel-inner">
        <div className={`ui-accordion__body ${className}`}>{children}</div>
      </div>
    </div>
  )
}
