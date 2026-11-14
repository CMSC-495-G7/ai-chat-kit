import { useEffect, useId, useRef, useState } from 'react'
import { SearchIcon, XIcon } from '../../primitives/icons'
import type { OmniboxProps, OmniboxSuggestion } from './types'

const DEFAULT_HINTS = (
  <>
    <span>
      <kbd className="font-bold text-ink">↑↓</kbd> move
    </span>
    <span>
      <kbd className="font-bold text-ink">↵</kbd> apply
    </span>
    <span>
      <kbd className="font-bold text-ink">⌫</kbd> remove last chip
    </span>
  </>
)

/**
 * One field that both searches and filters.
 *
 * The active filters live *inside* the border as chips, so the control reads
 * as one idea rather than a search box that happens to have a filter bar
 * stuck under it. Typing offers two things at once: the free-text search
 * across every field, and the same text narrowed to one field — which is the
 * whole point, because "search for cres" and "name contains cres" are
 * different questions that every other filter UI makes you decide between
 * before you start typing.
 *
 * Each suggestion names the query parameter it produces. That is what makes
 * the control learnable instead of magic: after a few uses you know what
 * `?search=` does differently from `name__icontains`, and the ones who never
 * look have lost nothing.
 *
 * Chips wrap onto further lines rather than running off the edge, so a long
 * list of filters grows the field instead of hiding some of them.
 *
 * Inert about data — it never filters anything. `groups` are supplied by the
 * host, already matched against `value`, and `onSelect` is the host's.
 */
export function Omnibox({
  label,
  value,
  onValueChange,
  placeholder,
  chips = [],
  groups = [],
  onRemoveLast,
  suffix,
  quick,
  shortcut,
  onMenuChange,
  hints = DEFAULT_HINTS,
  className = '',
}: OmniboxProps) {
  const baseId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const quickRef = useRef<HTMLDivElement>(null)
  // Escape inside the quick picks hands focus back to the field. The field
  // opens its menu on focus, so that one focus must not open it again.
  const skipOpen = useRef(false)
  const [open, setOpen] = useState(false)
  const [highlight, setActive] = useState(0)

  const flat: OmniboxSuggestion[] = groups.flatMap((g) => g.items)
  const showQuick = open && quick != null && value === '' && flat.length === 0
  const showMenu = open && (flat.length > 0 || showQuick)

  // Clamp rather than reset: the list reflows on every keystroke, and snapping
  // the highlight back to the top each time makes arrowing down impossible.
  const active = Math.min(highlight, Math.max(0, flat.length - 1))
  // Where each group's first item sits in `flat`, for the ids and the highlight.
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.items.length, 0))

  // Pointer-down, not click: a click on a suggestion would otherwise blur the
  // input and close the menu before the selection landed.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    onMenuChange?.(showMenu)
  }, [showMenu, onMenuChange])

  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut])

  // A choice is done: the menu closes, and a click on the field opens it again.
  const choose = (s: OmniboxSuggestion) => {
    s.onSelect()
    setActive(0)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && showQuick) {
      e.preventDefault()
      quickRef.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!showMenu) return setOpen(true)
      e.preventDefault()
      setActive(
        e.key === 'ArrowDown'
          ? (active + 1) % flat.length
          : (active - 1 + flat.length) % flat.length,
      )
      return
    }
    if (e.key === 'Enter' && showMenu && flat[active]) {
      e.preventDefault()
      choose(flat[active])
      return
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key === 'Backspace' && value === '' && chips.length > 0) {
      onRemoveLast?.()
    }
  }

  // Arrows walk the quick picks in reading order; Up from the first goes back to the field.
  const onQuickKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      skipOpen.current = true
      inputRef.current?.focus()
      return
    }
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    if (!forward && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return
    const buttons = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled)')]
    const at = buttons.indexOf(e.target as HTMLElement)
    if (at === -1) return
    e.preventDefault()
    if (!forward && at === 0) {
      skipOpen.current = true
      inputRef.current?.focus()
      return
    }
    buttons[forward ? Math.min(buttons.length - 1, at + 1) : at - 1]?.focus()
  }

  return (
    <div ref={wrapRef} className={['relative min-w-0', className].filter(Boolean).join(' ')}>
      <label htmlFor={`${baseId}-input`} className="sr-only">
        {label}
      </label>

      <div className="flex min-h-[42px] min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 rounded-surface border border-line bg-panel-solid px-3 py-1.5 transition focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20">
        <SearchIcon width={16} height={16} className="shrink-0 text-ink-soft" />

        {chips.map((chip) => (
          <span
            key={chip.id}
            title={chip.title}
            className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-control bg-chip py-0.5 pr-1 pl-2 text-[12.5px] font-bold text-chip-fg"
          >
            {chip.prefix && (
              <span className="shrink-0 font-semibold opacity-65">{chip.prefix}</span>
            )}
            <span className="min-w-0 truncate">{chip.label}</span>
            {chip.onRemove && (
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={
                  chip.removeLabel ??
                  `Remove ${chip.prefix ?? ''}${typeof chip.label === 'string' ? chip.label : 'filter'}`
                }
                className="inline-grid size-[18px] shrink-0 place-items-center rounded transition hover:bg-chip-hover"
              >
                <XIcon width={10} height={10} />
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          id={`${baseId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showMenu}
          aria-controls={`${baseId}-list`}
          aria-activedescendant={showMenu && !showQuick ? `${baseId}-opt-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onValueChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (skipOpen.current) {
              skipOpen.current = false
              return
            }
            setOpen(true)
          }}
          // A click on a field that already has focus fires no focus event, so after the menu
          // was dismissed it is the only way back besides typing.
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-24 basis-24 grow bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-ink-soft"
        />

        {suffix && <span className="ml-auto flex shrink-0 items-center">{suffix}</span>}
      </div>

      {showQuick && (
        <div
          id={`${baseId}-list`}
          ref={quickRef}
          role="group"
          aria-label={label}
          onKeyDown={onQuickKeyDown}
          // Clicking a pick must not take focus from the field, or the menu closes under it.
          onPointerDown={(e) => e.preventDefault()}
          className="absolute top-[calc(100%+6px)] left-0 z-30 w-full max-w-[40rem] rounded-surface border border-line bg-panel-solid p-2 shadow-[0_12px_32px_var(--shadow-raised)]"
        >
          {typeof quick === 'function' ? quick({ close: () => setOpen(false) }) : quick}
        </div>
      )}

      {showMenu && !showQuick && (
        <div
          id={`${baseId}-list`}
          role="listbox"
          aria-label={label}
          className="absolute top-[calc(100%+6px)] left-0 z-30 w-full max-w-[34rem] overflow-hidden rounded-surface border border-line bg-panel-solid p-2 shadow-[0_12px_32px_var(--shadow-raised)]"
        >
          {groups.map((g, gi) => (
            <div key={g.id} className="flex flex-col">
              <span className="px-2.5 pt-2 pb-1.5 text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase">
                {g.label}
              </span>
              {g.items.map((item, ii) => {
                const i = starts[gi] + ii
                return (
                  <button
                    key={item.id}
                    id={`${baseId}-opt-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onPointerDown={(e) => e.preventDefault()}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => choose(item)}
                    className={[
                      'flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left transition',
                      i === active ? 'bg-chip' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.icon && (
                      <span className="inline-grid size-[22px] shrink-0 place-items-center rounded-control bg-chip text-[10px] font-extrabold text-chip-fg">
                        {item.icon}
                      </span>
                    )}
                    <span className="grow truncate text-[13.5px] text-ink">{item.label}</span>
                    {item.hint && (
                      <span className="shrink-0 text-[11px] font-semibold text-ink-soft">
                        {item.hint}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          {hints && (
            <div className="mt-1.5 flex items-center gap-3.5 border-t border-line px-2.5 pt-2 pb-1 text-[11px] text-ink-soft">
              {hints}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
