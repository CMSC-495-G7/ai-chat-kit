import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, Ref, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayLayer } from '../../hooks/useOverlayLayer'
import { FieldLabel } from '../field'
import { CheckIcon, ChevronDownIcon, PlusIcon } from '../icons'
import type { SelectAction, SelectOption, SelectProps, SelectSize, SelectValue } from './types'

const insides: Record<SelectSize, string> = {
  sm: 'gap-1.5 pr-2 pl-2.5 text-[12.5px]',
  md: 'gap-2 pr-2.5 pl-3 text-[13px]',
}

const heights: Record<SelectSize, string> = { sm: 'h-8', md: 'h-9' }

const rows: Record<SelectSize, string> = {
  sm: 'min-h-7 gap-2 px-2 py-1 text-[12.5px]',
  md: 'min-h-8 gap-2.5 px-2.5 py-1.5 text-[13px]',
}

const GAP = 4
const EDGE = 8
const MAX_HEIGHT = 320
const MAX_WIDTH = 320
const TYPEAHEAD_MS = 500

type Item = { kind: 'option'; option: SelectOption } | { kind: 'action'; action: SelectAction }

type Placement = { left: number; minWidth: number; maxWidth: number; maxHeight: number } & (
  | { top: number; bottom?: undefined }
  | { bottom: number; top?: undefined }
)

/** Values compare as text, as a native select's do: `25` matches `'25'`. */
const same = (a: SelectValue | null | undefined, b: SelectValue | null | undefined) =>
  a != null && b != null && String(a) === String(b)

const enabled = (item: Item) =>
  item.kind === 'option' ? !item.option.disabled : !item.action.disabled

const textOf = (option: SelectOption) =>
  option.textValue ??
  (typeof option.label === 'string' || typeof option.label === 'number'
    ? String(option.label)
    : String(option.value))

/** Options under their group names, groups in the order they first appear. */
function grouped(options: SelectOption[]) {
  const groups: { name?: string; options: SelectOption[] }[] = []
  for (const option of options) {
    let group = groups.find((g) => g.name === option.group)
    if (!group) groups.push((group = { name: option.group, options: [] }))
    group.options.push(option)
  }
  return groups
}

function assign<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node)
  else if (ref) (ref as RefObject<T | null>).current = node
}

/**
 * A button that opens a list of options, the same list in every browser.
 *
 * It was a native `<select>`, and the platform popup is still the right call
 * for a plain choice. It stopped being enough once a choice needed a way out
 * — "New client" when the client is not there yet. A native popup has nowhere
 * to put that, so this draws its own listbox and follows the ARIA select-only
 * combobox pattern: focus stays on the button, the arrows move through the
 * options, Enter or Space chooses, Escape closes, and typing jumps to the
 * option that starts with what was typed.
 *
 * Two optional actions, both from the design: `action` sits on the label's
 * line, always in view; `listAction` is the last row of the open list, under
 * a rule, for something that belongs with the options — "Import clients".
 *
 * `label` is optional. Without it the select is labelled from outside, as it
 * always was: `FieldLabel` with `htmlFor`, or `aria-label` in a toolbar.
 */
export function Select({
  options,
  value: controlled,
  defaultValue = null,
  onChange,
  placeholder,
  label,
  action,
  listAction,
  emptyLabel,
  size = 'md',
  disabled = false,
  name,
  required,
  id,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ref,
}: SelectProps) {
  const auto = useId()
  const triggerId = id ?? `${auto}-select`
  const labelId = `${triggerId}-label`
  const listId = `${triggerId}-list`
  const optionId = (index: number) => `${triggerId}-option-${index}`

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const typed = useRef({ text: '', at: 0 })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const [pos, setPos] = useState<Placement | null>(null)
  const layer = useOverlayLayer(open ? triggerRef.current : null)

  const value = controlled !== undefined ? controlled : uncontrolled
  const invalid = ariaInvalid === true || ariaInvalid === 'true'
  const selected = options.find((o) => same(o.value, value))

  const groups = useMemo(() => grouped(options), [options])
  const items = useMemo<Item[]>(
    () => [
      ...groups.flatMap((g) => g.options.map((option) => ({ kind: 'option' as const, option }))),
      ...(listAction ? [{ kind: 'action' as const, action: listAction }] : []),
    ],
    [groups, listAction],
  )

  const setTrigger = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      assign(ref, node)
    },
    [ref],
  )

  const close = useCallback(() => {
    setOpen(false)
    setActive(-1)
    setPos(null)
  }, [])

  /** The next enabled item from `from`, stepping by `step`; `from` itself counts. */
  const seek = (from: number, step: 1 | -1) => {
    for (let i = from; i >= 0 && i < items.length; i += step) if (enabled(items[i])) return i
    return -1
  }

  const show = (at: 'selected' | 'first' | 'last') => {
    const current = items.findIndex((i) => i.kind === 'option' && same(i.option.value, value))
    const index =
      at === 'last'
        ? seek(items.length - 1, -1)
        : at === 'selected' && current >= 0 && enabled(items[current])
          ? current
          : seek(0, 1)
    setActive(index)
    setOpen(true)
  }

  const choose = (item: Item) => {
    if (!enabled(item)) return
    close()
    if (item.kind === 'action') return item.action.onSelect()
    const next = item.option.value
    if (controlled === undefined) setUncontrolled(next)
    if (!same(next, value)) onChange?.(next)
  }

  /** Jumps to the option starting with what has been typed in the last half-second. */
  const typeahead = (event: KeyboardEvent) => {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return false
    const now = Date.now()
    const text = (now - typed.current.at > TYPEAHEAD_MS ? '' : typed.current.text) + event.key
    typed.current = { text: text.toLowerCase(), at: now }
    // A repeated single letter cycles through the options that start with it.
    const cycling = [...typed.current.text].every((c) => c === typed.current.text[0])
    const query = cycling ? typed.current.text[0] : typed.current.text
    const start = open && active >= 0 ? active + (cycling ? 1 : 0) : 0
    const order = [...items.keys()].map((i) => (start + i) % items.length)
    const match = order.find((i) => {
      const item = items[i]
      return (
        item.kind === 'option' &&
        enabled(item) &&
        textOf(item.option).toLowerCase().startsWith(query)
      )
    })
    if (match === undefined) return true
    setActive(match)
    setOpen(true)
    return true
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event
    const typing = Date.now() - typed.current.at <= TYPEAHEAD_MS && typed.current.text !== ''
    if (key === ' ' && typing) {
      event.preventDefault()
      typeahead(event)
      return
    }
    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault()
        show(key === 'ArrowUp' ? 'last' : 'selected')
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault()
        show(key === 'Home' ? 'first' : 'last')
      } else if (typeahead(event)) {
        event.preventDefault()
      }
      return
    }
    const step = (from: number, by: 1 | -1) => {
      const next = seek(from, by)
      if (next >= 0) setActive(next)
    }
    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        if (event.altKey) break
        step(active + 1, 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (event.altKey) {
          if (active >= 0) choose(items[active])
          else close()
          break
        }
        step(Math.max(active - 1, 0), -1)
        break
      case 'Home':
        event.preventDefault()
        step(0, 1)
        break
      case 'End':
        event.preventDefault()
        step(items.length - 1, -1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (active >= 0) choose(items[active])
        else close()
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        close()
        break
      default:
        if (typeahead(event)) event.preventDefault()
    }
  }

  // Placed below the box, or above it when that leaves more room, and kept
  // there through resizes and scrolling.
  useLayoutEffect(() => {
    const anchor = triggerRef.current
    if (!open || !anchor || !layer) return
    const place = () => {
      const panel = panelRef.current
      if (!panel) return
      const r = anchor.getBoundingClientRect()
      const below = window.innerHeight - r.bottom - GAP - EDGE
      const above = r.top - GAP - EDGE
      const up = Math.min(panel.scrollHeight, MAX_HEIGHT) > below && above > below
      const maxWidth = Math.min(Math.max(r.width, MAX_WIDTH), window.innerWidth - EDGE * 2)
      const width = Math.min(Math.max(panel.offsetWidth, r.width), maxWidth)
      const left = Math.max(EDGE, Math.min(r.left, window.innerWidth - width - EDGE))
      const shared = {
        left,
        minWidth: r.width,
        maxWidth,
        maxHeight: Math.min(MAX_HEIGHT, up ? above : below),
      }
      setPos(
        up
          ? { ...shared, bottom: window.innerHeight - r.top + GAP }
          : { ...shared, top: r.bottom + GAP },
      )
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, layer, items])

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      const path = event.composedPath()
      if (triggerRef.current && path.includes(triggerRef.current)) return
      if (panelRef.current && path.includes(panelRef.current)) return
      close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, close])

  useEffect(() => {
    if (!open || active < 0 || !pos) return
    panelRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, active, pos])

  const row = (item: Item, index: number, content: ReactNode, extra = '') => (
    <div
      key={index}
      id={optionId(index)}
      role="option"
      data-index={index}
      aria-selected={item.kind === 'option' && same(item.option.value, value)}
      aria-disabled={enabled(item) ? undefined : true}
      onMouseMove={() => enabled(item) && active !== index && setActive(index)}
      onClick={() => choose(item)}
      className={[
        'flex items-center rounded-control text-left text-ink',
        rows[size],
        index === active ? 'bg-tint/8' : '',
        enabled(item) ? 'cursor-pointer' : 'cursor-default opacity-40',
        extra,
      ].join(' ')}
    >
      {content}
    </div>
  )

  let index = 0
  const list = (
    <div
      ref={panelRef}
      // Keeps focus on the button while the pointer works the list.
      onMouseDown={(event) => event.preventDefault()}
      style={{
        position: 'fixed',
        left: pos?.left ?? 0,
        top: pos?.bottom === undefined ? (pos?.top ?? 0) : undefined,
        bottom: pos?.bottom,
        minWidth: pos?.minWidth,
        maxWidth: pos?.maxWidth,
        maxHeight: pos?.maxHeight ?? MAX_HEIGHT,
        pointerEvents: 'auto',
        visibility: pos ? 'visible' : 'hidden',
      }}
      className="flex flex-col overflow-y-auto overscroll-contain rounded-surface border border-line bg-panel-solid p-1 shadow-xl shadow-(color:--shadow-menu)"
    >
      <div
        id={listId}
        role="listbox"
        aria-labelledby={label != null ? labelId : ariaLabelledBy}
        aria-label={label == null && !ariaLabelledBy ? ariaLabel : undefined}
        className="flex flex-col gap-px"
      >
        {groups.map((group, g) => {
          const optionRows = group.options.map((option) => {
            const item = items[index]
            const chosen = same(option.value, value)
            return row(
              item,
              index++,
              <>
                <span className="inline-grid size-4 shrink-0 place-items-center text-accent-fg">
                  {chosen && <CheckIcon width={14} height={14} />}
                </span>
                <span className="min-w-0 flex-1">{option.label}</span>
              </>,
            )
          })
          if (group.name == null) return optionRows
          const headingId = `${listId}-group-${g}`
          return (
            <div
              key={group.name}
              role="group"
              aria-labelledby={headingId}
              className="flex flex-col gap-px"
            >
              <div
                id={headingId}
                className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-wide text-ink-soft uppercase"
              >
                {group.name}
              </div>
              {optionRows}
            </div>
          )
        })}
        {options.length === 0 && emptyLabel != null && (
          <div className={`flex items-center text-ink-soft ${rows[size]}`}>{emptyLabel}</div>
        )}
        {listAction && (
          <>
            {options.length > 0 && <div aria-hidden="true" className="mx-1 my-1 h-px bg-line" />}
            {row(
              items[index],
              index,
              <>
                <span className="inline-grid size-4 shrink-0 place-items-center">
                  {listAction.icon === undefined ? (
                    <PlusIcon width={14} height={14} />
                  ) : (
                    listAction.icon
                  )}
                </span>
                <span className="min-w-0 flex-1">{listAction.label}</span>
              </>,
              'font-semibold text-ink-strong',
            )}
          </>
        )}
      </div>
    </div>
  )

  const trigger = (
    <button
      ref={setTrigger}
      id={triggerId}
      type="button"
      role="combobox"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listId : undefined}
      aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
      aria-labelledby={label != null ? labelId : ariaLabelledBy}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      onClick={() => (open ? close() : show('selected'))}
      onKeyDown={onKeyDown}
      onBlur={close}
      className={[
        'flex w-full min-w-0 items-center rounded-control border bg-panel-solid text-left outline-none transition',
        'disabled:pointer-events-none disabled:opacity-40',
        invalid
          ? `border-danger focus-visible:ring-3 focus-visible:ring-danger/15 ${open ? 'ring-3 ring-danger/15' : ''}`
          : open
            ? 'border-accent ring-3 ring-accent/20'
            : 'border-line hover:border-ink-soft/40 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
        heights[size],
        insides[size],
      ].join(' ')}
    >
      <span className={`min-w-0 flex-1 truncate ${selected ? 'text-ink' : 'text-ink-soft'}`}>
        {selected ? selected.label : placeholder}
      </span>
      <ChevronDownIcon
        width={12}
        height={12}
        aria-hidden="true"
        className={`shrink-0 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )

  // Every label, stacked under the box with no height, so the box is as wide
  // as the longest one, as a native select is, and does not jump on a change.
  // Outside the button, so the button's text is only its value.
  const sizer = (
    <span
      aria-hidden="true"
      className={`invisible flex h-0 flex-col overflow-hidden border-x whitespace-nowrap ${insides[size]}`}
    >
      {[placeholder, ...options.map((o) => o.label)].map((text, i) => (
        <span key={i} className="flex gap-[inherit]">
          {text}
          <span className="w-3 shrink-0" />
        </span>
      ))}
    </span>
  )

  const hidden = name && (
    <input type="hidden" name={name} value={value == null ? '' : String(value)} />
  )
  const popup = open && layer ? createPortal(list, layer) : null

  if (label == null) {
    return (
      <span className={['inline-grid min-w-0 align-middle', className].filter(Boolean).join(' ')}>
        {trigger}
        {sizer}
        {hidden}
        {popup}
      </span>
    )
  }

  return (
    <span className={['flex min-w-0 flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      <span className="flex items-baseline justify-between gap-3">
        <FieldLabel id={labelId} htmlFor={triggerId}>
          {label}
        </FieldLabel>
        {action && (
          <button
            type="button"
            disabled={disabled || action.disabled}
            onClick={action.onSelect}
            className={[
              'inline-flex shrink-0 items-center gap-1 rounded-sm text-[12.5px] font-semibold text-ink-strong',
              'underline decoration-ink-strong/30 decoration-[1.5px] underline-offset-4 transition',
              'hover:decoration-ink-strong disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40',
            ].join(' ')}
          >
            {action.icon === undefined ? <PlusIcon width={12} height={12} /> : action.icon}
            {action.label}
          </button>
        )}
      </span>
      <span className="grid min-w-0">
        {trigger}
        {sizer}
      </span>
      {hidden}
      {popup}
    </span>
  )
}
