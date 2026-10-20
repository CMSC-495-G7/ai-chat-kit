import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type {
  TabsActivationMode,
  TabsContentProps,
  TabsListProps,
  TabsListVariant,
  TabsOrientation,
  TabsProps,
  TabsTriggerProps,
} from './types'

type TabsContextValue = {
  value: string | null | undefined
  select: (value: string) => void
  orientation: TabsOrientation
  activationMode: TabsActivationMode
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)
type TabsListContextValue = {
  variant: Exclude<TabsListVariant, 'contained'>
  firstValue?: string
}

const TabsListContext = createContext<TabsListContextValue>({ variant: 'line' })

function useTabs(part: string) {
  const context = useContext(TabsContext)
  if (!context) throw new Error(`${part} must be used inside Tabs`)
  return context
}

function valueId(value: string) {
  return encodeURIComponent(value).replaceAll('%', '-')
}

/**
 * A branded tab set with the same compound shape as shadcn/Radix: root, list,
 * trigger, and content. It supports controlled and uncontrolled selection.
 */
export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  allowDeselect = false,
  orientation = 'horizontal',
  activationMode = 'automatic',
  className = '',
  children,
  ...rest
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const baseId = useId()
  const controlled = controlledValue !== undefined
  const value = controlled ? controlledValue : uncontrolledValue

  const select = (next: string) => {
    const selected = allowDeselect && next === value ? null : next
    if (!controlled) setUncontrolledValue(selected)
    if (selected !== value) onValueChange?.(selected)
  }

  return (
    <TabsContext.Provider value={{ value, select, orientation, activationMode, baseId }}>
      <div className={`min-w-0 ${className}`} data-orientation={orientation} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

/** The tab rail: `line` by default, `segmented` for switching views of one thing. */
export function TabsList({ variant = 'line', className = '', children, ...rest }: TabsListProps) {
  const { orientation } = useTabs('TabsList')
  const skinName = variant === 'contained' ? 'segmented' : variant
  const firstTrigger = Children.toArray(children).find(
    (child) => isValidElement<TabsTriggerProps>(child) && child.type === TabsTrigger,
  )
  const firstValue = isValidElement<TabsTriggerProps>(firstTrigger)
    ? firstTrigger.props.value
    : undefined
  const line =
    orientation === 'horizontal'
      ? 'flex items-end gap-6 border-b border-line'
      : 'flex shrink-0 flex-col gap-0.5 border-l border-line'
  const segmented =
    orientation === 'horizontal'
      ? 'inline-flex items-center gap-0.5 rounded-surface border border-line bg-chip p-1'
      : 'inline-flex shrink-0 flex-col gap-0.5 rounded-surface border border-line bg-chip p-1'
  const skin = skinName === 'line' ? line : skinName === 'segmented' ? segmented : ''

  return (
    <TabsListContext.Provider value={{ variant: skinName, firstValue }}>
      <div
        {...rest}
        role="tablist"
        aria-orientation={orientation}
        className={`${skin} ${className}`}
      >
        {children}
      </div>
    </TabsListContext.Provider>
  )
}

function moveFocus(event: KeyboardEvent<HTMLButtonElement>, orientation: TabsOrientation) {
  const horizontal = orientation === 'horizontal'
  const previous = horizontal ? event.key === 'ArrowLeft' : event.key === 'ArrowUp'
  const next = horizontal ? event.key === 'ArrowRight' : event.key === 'ArrowDown'
  if (!previous && !next && event.key !== 'Home' && event.key !== 'End') return

  const list = event.currentTarget.closest('[role="tablist"]')
  const tabs = Array.from(
    list?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
  )
  if (!tabs.length) return

  event.preventDefault()
  const current = tabs.indexOf(event.currentTarget)
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : previous
          ? (current - 1 + tabs.length) % tabs.length
          : (current + 1) % tabs.length
  tabs[index]?.focus()
}

/**
 * The selected label steps up to extra-bold. A plain-text label reserves that
 * width with an invisible bold copy, so neighbours do not shift on selection.
 */
function Label({ children }: { children: ReactNode }) {
  if (typeof children !== 'string' && typeof children !== 'number') return <>{children}</>
  return (
    <span className="inline-grid">
      <span className="col-start-1 row-start-1">{children}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-extrabold">
        {children}
      </span>
    </span>
  )
}

// The `line` bar: rounded, 3px, grown from the centre. Vertical lists put it on
// the leading edge.
const bar = {
  horizontal:
    '-mb-px h-11 px-0.5 after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t-[3px] after:scale-x-0 data-[state=active]:after:scale-x-100',
  vertical:
    '-ml-px min-h-9 justify-start px-3.5 after:inset-y-1.5 after:left-0 after:w-[3px] after:rounded-r-[3px] after:scale-y-0 data-[state=active]:after:scale-y-100',
}

/** A native button with roving focus and automatic or manual activation. */
export function TabsTrigger({
  value,
  icon,
  count,
  disabled,
  className = '',
  children,
  onClick,
  onKeyDown,
  onFocus,
  tabIndex,
  controls,
  ...rest
}: TabsTriggerProps) {
  const tabs = useTabs('TabsTrigger')
  const { variant, firstValue } = useContext(TabsListContext)
  const selected = tabs.value === value
  const id = valueId(value)
  const line = `relative after:absolute after:bg-brand-fg after:transition-transform after:duration-300 after:ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:after:transition-none ${bar[tabs.orientation]}`
  const segmented = 'min-h-8 rounded-control px-3.5'
  const skin =
    variant === 'line'
      ? `${line} ${selected ? 'text-ink-strong' : 'text-ink-soft hover:text-ink-strong'}`
      : `${segmented} ${selected ? 'bg-panel-solid text-ink-strong shadow-sm shadow-(color:--shadow-soft)' : 'text-ink-soft hover:text-ink-strong'}`
  const base =
    variant === 'unstyled'
      ? 'shrink-0 disabled:pointer-events-none disabled:opacity-35'
      : `inline-flex shrink-0 items-center gap-2 text-[13.5px] whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-35 ${selected ? 'font-extrabold' : 'font-semibold'} ${skin}`

  return (
    <button
      {...rest}
      type="button"
      role="tab"
      id={`${tabs.baseId}-trigger-${id}`}
      aria-controls={controls === false ? undefined : (controls ?? `${tabs.baseId}-panel-${id}`)}
      aria-selected={selected}
      tabIndex={
        selected ? 0 : tabs.value == null ? (tabIndex ?? (value === firstValue ? 0 : -1)) : -1
      }
      disabled={disabled}
      data-state={selected ? 'active' : 'inactive'}
      className={`${base} ${className}`}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) tabs.select(value)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        moveFocus(event, tabs.orientation)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        if (!event.defaultPrevented && tabs.activationMode === 'automatic') tabs.select(value)
      }}
    >
      {icon != null && (
        <span aria-hidden="true" className="inline-grid shrink-0 place-items-center">
          {icon}
        </span>
      )}
      <Label>{children}</Label>
      {count != null && (
        <span
          className={`inline-grid h-[18px] min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-extrabold tabular-nums transition-colors ${
            selected ? 'bg-chip text-chip-fg' : 'bg-tint/6 text-ink-soft'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/** The panel paired to a trigger with the same `value`. */
export function TabsContent({ value, className = '', children, ...rest }: TabsContentProps) {
  const tabs = useTabs('TabsContent')
  const selected = tabs.value === value
  const id = valueId(value)

  if (!selected) return null

  return (
    <div
      {...rest}
      role="tabpanel"
      id={`${tabs.baseId}-panel-${id}`}
      aria-labelledby={`${tabs.baseId}-trigger-${id}`}
      tabIndex={0}
      className={`min-w-0 ${tabs.orientation === 'horizontal' ? 'mt-4' : 'flex-1'} ${className}`}
    >
      {children}
    </div>
  )
}
