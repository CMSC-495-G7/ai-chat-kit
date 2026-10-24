import type { ReactNode } from 'react'
import { SearchIcon } from '../../primitives/icons'
import { Link, type NavigateHandler } from '../../primitives/link'
import { SectionLabel } from '../../primitives/section-label'

// The few shapes every panel is made of, so the panels of different apps read
// as one menu: a search box, a small heading, and a row.

export type MenuPanelSearchProps = {
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function MenuPanelSearch({ label, placeholder, value, onChange }: MenuPanelSearchProps) {
  return (
    <label className="flex items-center gap-2 rounded-control bg-tint/5 px-2.5 py-2 text-ink-soft focus-within:ring-2 focus-within:ring-accent">
      <SearchIcon width={14} height={14} aria-hidden />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        placeholder={placeholder ?? label}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
      />
    </label>
  )
}

/** A small heading over a group of rows. */
export function MenuPanelLabel({ children }: { children: ReactNode }) {
  return <SectionLabel className="px-2 pt-4 pb-1.5">{children}</SectionLabel>
}

export type MenuPanelRowProps = {
  name: ReactNode
  /** A second line under the name. */
  sub?: ReactNode
  /** The count at the end of the row. */
  count?: ReactNode
  /** The colour of the dot before the name, as a class: `bg-notify`. */
  dot?: string
  /** What goes before the name, in place of a dot: a checkbox, say. */
  leading?: ReactNode
  /** The row is the page you are on. */
  current?: boolean
  href?: string
  onSelect?: () => void
  onNavigate?: NavigateHandler
}

const row =
  'flex w-full min-w-0 items-center gap-2 rounded-control px-2 py-1.5 text-left text-sm transition'
const on = 'bg-chip font-bold text-chip-fg'
const off = 'text-ink hover:bg-tint/5'

/** One row: a dot or a control, a name, and what is worth a glance beside it. */
export function MenuPanelRow({
  name,
  sub,
  count,
  dot,
  leading,
  current = false,
  href,
  onSelect,
  onNavigate,
}: MenuPanelRowProps) {
  const className = `${row} ${sub ? 'min-h-11' : 'min-h-9'} ${current ? on : off}`
  const body = (
    <>
      {leading ?? (dot && <span aria-hidden className={`size-2 shrink-0 rounded-full ${dot}`} />)}
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate">{name}</span>
        {sub && <span className="truncate text-xs font-normal text-ink-soft">{sub}</span>}
      </span>
      {count !== undefined && (
        <span className={`shrink-0 text-xs tabular-nums ${current ? '' : 'text-ink-soft'}`}>
          {count}
        </span>
      )}
    </>
  )
  return href ? (
    <Link
      variant="plain"
      href={href}
      aria-current={current ? 'page' : undefined}
      onNavigate={onNavigate}
      onClick={onSelect}
      className={className}
    >
      {body}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={current || undefined}
      className={className}
    >
      {body}
    </button>
  )
}
