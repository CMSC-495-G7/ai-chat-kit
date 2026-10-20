import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDownIcon,
  ArrowToTopIcon,
  CopyIcon,
  DotsIcon,
  GripIcon,
  PencilIcon,
  SendIcon,
  TrashIcon,
} from '../../../../primitives/icons'
import { IconButton } from '../../../../primitives/icon-button'
import { keyLabels } from '../../../../lib/keyLabels'
import type { QueueRowProps } from '../types'

/**
 * One queued message.
 *
 * Every control is rendered at all times and revealed with opacity — a row
 * whose buttons appear by *mounting* would resize under the pointer on hover,
 * which is the exact class of movement this whole dock exists to stop.
 */
export function QueueRow({
  item,
  index,
  total,
  next,
  held,
  planning = false,
  busy,
  compact,
  minimized,
  onSendNow,
  onEdit,
  onMove,
  onRemove,
  onFocusSibling,
  registerRef,
}: QueueRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.text)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropping, setDropping] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const rowRef = useRef<HTMLLIElement>(null)

  // Close on outside click. composedPath() (not contains()) because inside the
  // widget's shadow root, events reaching the document are retargeted to the
  // shadow host and contains() would always fail.
  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !e.composedPath().includes(menuRef.current)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  // A menu button opens onto its first item: role="menu" promises keyboard
  // navigation, and a menu you can only reach with a mouse does not keep it.
  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus()
  }, [menuOpen])

  useEffect(() => {
    if (!editing) return
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [editing])

  // An edit started elsewhere rewrote this message underneath us.
  useEffect(() => {
    if (!editing) setDraft(item.text)
  }, [item.text, editing])

  const startEdit = () => {
    setDraft(item.text)
    setEditing(true)
    setMenuOpen(false)
  }
  const closeEdit = () => {
    setEditing(false)
    // The editing row has no tabindex; focus it once the resting one is back.
    requestAnimationFrame(() => rowRef.current?.focus())
  }
  const commit = () => {
    closeEdit()
    if (draft.trim() !== item.text) onEdit(item.id, draft)
  }
  const cancel = () => {
    setDraft(item.text)
    closeEdit()
  }

  if (editing) {
    return (
      <li
        ref={rowRef}
        className="rounded-control border border-accent/70 bg-panel-solid px-2.5 py-2 ring-3 ring-accent/15"
      >
        <label htmlFor={`queued-${item.id}`} className="sr-only">
          Edit queued message
        </label>
        <textarea
          id={`queued-${item.id}`}
          ref={textareaRef}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              cancel()
            }
          }}
          className="w-full resize-none bg-transparent text-[13px] leading-snug text-ink-strong outline-none"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <span className="flex-1 text-[11px] text-ink-soft">Enter saves · Esc cancels</span>
          <button
            type="button"
            onClick={cancel}
            className="rounded-control px-2 py-1 text-[11px] font-semibold text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            className="rounded-control bg-brand-solid px-2.5 py-1 text-[11px] font-bold text-on-brand-solid transition hover:brightness-95"
          >
            Save
          </button>
        </div>
      </li>
    )
  }

  // The next-up row earns its second line; everything else stays one line so
  // the dock's height is a function of the queue, not of what people wrote.
  const expanded = next && !minimized && !compact

  return (
    <li
      ref={(el) => {
        rowRef.current = el
        registerRef(item.id, el)
      }}
      tabIndex={0}
      aria-label={`Queued message ${index + 1} of ${total}: ${item.text}`}
      aria-keyshortcuts="Enter Backspace Alt+ArrowUp Alt+ArrowDown"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/queued-id', String(item.id))
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('text/queued-id')) return
        e.preventDefault()
        setDropping(true)
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        setDropping(false)
        const dragged = Number(e.dataTransfer.getData('text/queued-id'))
        if (!dragged || dragged === item.id) return
        e.preventDefault()
        onMove(dragged, index)
      }}
      onKeyDown={(e) => {
        // Only when the row itself holds focus. Without this, Enter on the
        // Send now button would also open the editor, and an arrow key inside
        // the menu would walk the queue behind it.
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter') {
          e.preventDefault()
          startEdit()
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault()
          onRemove(item.id)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          const up = e.key === 'ArrowUp'
          if (e.altKey) onMove(item.id, up ? 'up' : 'down')
          else onFocusSibling(index, up ? -1 : 1)
        } else if (e.key === 'Escape') {
          rowRef.current?.blur()
        }
      }}
      className={`group/row relative flex gap-1.5 rounded-control outline-none transition-colors focus-visible:ring-3 focus-visible:ring-accent/25 ${
        expanded ? 'items-start py-1.5' : 'items-center py-1'
      } ${dropping ? 'bg-chip' : 'hover:bg-tint/5 focus-visible:bg-tint/5'}`}
    >
      {/* The ember edge is the promise that this one runs next. */}
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 -left-px w-[3px] rounded-full ${
          next ? 'bg-marker' : 'bg-transparent'
        }`}
      />

      {compact || minimized ? (
        <span className="w-2 shrink-0" aria-hidden />
      ) : (
        <span
          aria-hidden
          className="mt-px grid size-5 shrink-0 cursor-grab place-items-center text-ink-soft/50 opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100"
        >
          <GripIcon width={12} height={12} />
        </span>
      )}

      <div className={`min-w-0 flex-1 ${held ? 'opacity-60' : ''}`}>
        <p
          className={`text-[13px] leading-snug ${next ? 'font-semibold text-ink-strong' : 'text-ink'} ${
            expanded ? 'line-clamp-2' : 'truncate'
          }`}
        >
          {item.text}
        </p>
        {expanded && (
          <span className="mt-0.5 block text-[10px] font-bold tracking-wider text-marker uppercase">
            {planning
              ? 'Runs first when you start the queue'
              : held
                ? 'Paused — this one is next'
                : busy
                  ? 'Sends when this reply finishes'
                  : 'Sending…'}
          </span>
        )}
      </div>

      {/* Inline actions are the full-width app's affordance. Compact gets the
          same actions one tap deeper, in the menu — at the widget's 440px a
          row of three buttons still leaves nothing for the message itself. */}
      {!compact && !minimized && (
        <span
          className={`flex shrink-0 items-center gap-0.5 transition-opacity ${
            next
              ? 'opacity-100'
              : 'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100'
          }`}
        >
          {next && (
            <IconButton
              size="sm"
              shape="rounded"
              onClick={() => onSendNow(item.id)}
              aria-label={`Send message ${index + 1} now, interrupting the current reply`}
              title={`Send now (${keyLabels.mod}${keyLabels.enter})`}
              className="border border-accent/30 text-accent-fg hover:text-accent-fg"
            >
              <SendIcon width={13} height={13} />
            </IconButton>
          )}
          <IconButton
            size="sm"
            shape="rounded"
            onClick={startEdit}
            aria-label={`Edit queued message ${index + 1}`}
            title="Edit"
          >
            <PencilIcon width={13} height={13} />
          </IconButton>
        </span>
      )}

      {/* Every row but the first carries its own trash, dimmed at rest rather
          than hidden: dropping a queued question is the commonest edit here,
          and it was the one thing a menu kept from view. It is also the single
          inline control compact density can afford. The row that runs next is
          the exception — a one-click remove has no business sitting beside
          Send now, so there it stays in the menu. */}
      {!next && !minimized && (
        <IconButton
          size="sm"
          shape="rounded"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove queued message ${index + 1}`}
          title={`Remove (${keyLabels.backspace})`}
          className="opacity-60 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 hover:text-danger-fg"
        >
          <TrashIcon width={13} height={13} />
        </IconButton>
      )}

      {!minimized && (
        <div ref={menuRef} className="relative shrink-0">
          <IconButton
            ref={menuTriggerRef}
            size="sm"
            shape="rounded"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More options for queued message ${index + 1}`}
            title="More"
            className={
              next || menuOpen
                ? ''
                : 'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100'
            }
          >
            <DotsIcon width={13} height={13} />
          </IconButton>

          {menuOpen && (
            <div
              role="menu"
              aria-label={`Options for queued message ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Tab') {
                  setMenuOpen(false)
                  if (e.key === 'Escape') {
                    e.stopPropagation()
                    menuTriggerRef.current?.focus()
                  }
                  return
                }
                if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
                e.preventDefault()
                e.stopPropagation()
                const items = Array.from(
                  e.currentTarget.querySelectorAll<HTMLButtonElement>(
                    '[role="menuitem"]:not(:disabled)',
                  ),
                )
                if (items.length === 0) return
                const at = items.indexOf(document.activeElement as HTMLButtonElement)
                const delta = e.key === 'ArrowDown' ? 1 : -1
                items[(at + delta + items.length) % items.length].focus()
              }}
              className="absolute right-0 bottom-full z-30 mb-1 w-56 overflow-hidden rounded-control border border-line bg-panel-solid p-1.5 shadow-xl shadow-(color:--shadow-menu)"
            >
              {compact && (
                <>
                  <MenuItem
                    icon={<SendIcon width={14} height={14} />}
                    label="Send now"
                    hint={`${keyLabels.mod}${keyLabels.enter}`}
                    detail="Interrupts the reply in progress"
                    onClick={() => {
                      setMenuOpen(false)
                      onSendNow(item.id)
                    }}
                  />
                  <MenuItem
                    icon={<PencilIcon width={14} height={14} />}
                    label="Edit"
                    hint={keyLabels.enter}
                    onClick={startEdit}
                  />
                </>
              )}
              <MenuItem
                icon={<ArrowToTopIcon width={14} height={14} />}
                label="Move to front"
                hint={`${keyLabels.alt}↑`}
                disabled={index === 0}
                onClick={() => {
                  setMenuOpen(false)
                  onMove(item.id, 'front')
                }}
              />
              <MenuItem
                icon={<ArrowDownIcon width={14} height={14} />}
                label="Move down"
                hint={`${keyLabels.alt}↓`}
                disabled={index === total - 1}
                onClick={() => {
                  setMenuOpen(false)
                  onMove(item.id, 'down')
                }}
              />
              <MenuItem
                icon={<CopyIcon width={14} height={14} />}
                label="Copy text"
                onClick={() => {
                  setMenuOpen(false)
                  navigator.clipboard?.writeText(item.text)
                }}
              />
              {/* Only the first row: every other one wears its trash on the
                  row itself, and the same action twice in reach is noise. */}
              {next && (
                <>
                  <div className="my-1 h-px bg-line" />
                  <MenuItem
                    icon={<TrashIcon width={14} height={14} />}
                    label="Remove"
                    hint={keyLabels.backspace}
                    danger
                    onClick={() => {
                      setMenuOpen(false)
                      onRemove(item.id)
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function MenuItem({
  icon,
  label,
  hint,
  detail,
  danger = false,
  disabled = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  hint?: string
  detail?: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 rounded-control px-2.5 py-1.5 text-left transition hover:bg-tint/8 disabled:pointer-events-none disabled:opacity-35 ${
        danger ? 'text-danger-fg' : 'text-ink-strong'
      }`}
    >
      <span className={`mt-px shrink-0 ${danger ? 'text-danger-fg' : 'text-ink-soft'}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium">{label}</span>
        {detail && <span className="block text-[11px] leading-tight text-ink-soft">{detail}</span>}
      </span>
      {hint && (
        <span className="shrink-0 text-[11px] font-bold whitespace-nowrap text-ink-soft">
          {hint}
        </span>
      )}
    </button>
  )
}
