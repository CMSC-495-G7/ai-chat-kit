import { useEffect, useId, useRef, useState } from 'react'
import { QueueIcon, SparkleIcon } from '../../../../primitives/icons'
import { IconButton } from '../../../../primitives/icon-button'
import type { SuggestionsMenuProps } from '../types'

/**
 * Today's suggested questions for the tenant, behind the composer's sparkle.
 *
 * Separate from follow-ups on purpose: those branch off the answer on screen,
 * these are where someone starts. The footer switch turns on suggest-as-you-
 * type, which shows the same list whenever the empty draft has focus and
 * narrows it as they write — so the menu is the way in, and the switch makes
 * it ambient.
 */
export function SuggestionsMenu({
  suggestions,
  onPick,
  onQueue,
  typeahead,
  onTypeaheadChange,
  compact,
  placement = 'up',
}: SuggestionsMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const switchId = useId()

  // Close on outside click. composedPath() (not contains()) because inside the
  // widget's shadow root, events reaching the document are retargeted to the
  // shadow host and contains() would always fail.
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !e.composedPath().includes(menuRef.current)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const triggerProps = {
    type: 'button' as const,
    onClick: () => setOpen((o) => !o),
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
  }
  const activeFill = open ? 'bg-chip-hover' : 'bg-chip'

  return (
    <div
      ref={menuRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      {/* Icon only at every size: the sparkle carries it, and the dot says
          when suggest-as-you-type is on. */}
      <button
        {...triggerProps}
        ref={triggerRef}
        aria-label={
          typeahead ? 'Suggested questions (suggest as I type is on)' : 'Suggested questions'
        }
        title="Suggested questions"
        className={`relative flex items-center justify-center rounded-full text-chip-fg transition hover:bg-chip-hover ${
          compact ? 'p-1.5' : 'p-2'
        } ${activeFill}`}
      >
        <SparkleIcon width={compact ? 16 : 15} height={compact ? 16 : 15} className="text-accent" />
        {typeahead && <OnDot />}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Suggested questions for today"
          className={`absolute left-0 z-30 overflow-hidden ${placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} rounded-control border border-line bg-panel-solid p-1.5 shadow-xl shadow-(color:--shadow-menu) ${
            compact ? 'w-72' : 'w-96'
          }`}
        >
          <div className="flex items-baseline gap-2 px-2.5 pt-1.5">
            <span className="text-[13px] font-bold text-ink-strong">Suggested for today</span>
            <span className="ml-auto text-[11px] font-semibold text-ink-soft">{today}</span>
          </div>
          {!compact && (
            <p className="px-2.5 pb-1 text-xs text-ink-soft">
              Top questions for your organization, refreshed each morning
            </p>
          )}

          {suggestions.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-ink-soft">No suggestions yet today.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-px">
              {suggestions.map((s, i) => (
                <li key={s.text} className="group/sugg flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onPick(s.text)
                      setOpen(false)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-control px-2.5 py-2 text-left transition hover:bg-tint/8"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-control bg-chip text-[10.5px] font-bold text-chip-fg">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-semibold text-ink-strong ${compact ? 'text-[12.5px]' : 'text-[13px]'}`}
                      >
                        {s.text}
                      </span>
                      {s.reason && (
                        <span className="block text-[11px] text-ink-soft">{s.reason}</span>
                      )}
                    </span>
                  </button>
                  {onQueue && (
                    <IconButton
                      size="sm"
                      shape="rounded"
                      onClick={() => {
                        onQueue(s.text)
                        setOpen(false)
                      }}
                      aria-label={`Add “${s.text}” to the queue`}
                      title="Add to the queue"
                      className="shrink-0 opacity-60 group-focus-within/sugg:opacity-100 group-hover/sugg:opacity-100"
                    >
                      <QueueIcon width={14} height={14} />
                    </IconButton>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mx-1 my-1.5 h-px bg-line" />
          <div className="flex items-center gap-3 px-2.5 pb-1">
            <label htmlFor={switchId} className="min-w-0 flex-1 cursor-pointer">
              <span className="block text-[13px] font-semibold text-ink-strong">
                Suggest as I type
              </span>
              <span className="block text-[11px] text-ink-soft">
                {compact
                  ? 'Shown above the box while you write'
                  : 'Matching questions float above the box while you write'}
              </span>
            </label>
            <button
              id={switchId}
              type="button"
              role="switch"
              aria-checked={typeahead}
              onClick={() => onTypeaheadChange(!typeahead)}
              className={`flex h-6 w-10 shrink-0 items-center rounded-full p-[3px] transition-colors ${
                typeahead ? 'bg-accent' : 'bg-tint/25'
              }`}
            >
              <span
                className={`size-[18px] rounded-full bg-white shadow-sm transition-transform ${
                  typeahead ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Marks the trigger while suggest-as-you-type is on. */
function OnDot() {
  return (
    <span
      className="absolute top-0.5 right-0.5 size-2 rounded-full bg-accent ring-2 ring-panel-solid"
      aria-hidden
    />
  )
}
