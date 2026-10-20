import type { MenuItemProps } from '../types'

/** One action in a `Menu`: a glyph, a label, and optionally what it does. */
export function MenuItem({
  label,
  hint,
  icon,
  trailing,
  onSelect,
  disabled,
  tone = 'default',
  className = '',
}: MenuItemProps) {
  const danger = tone === 'danger'
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={`flex min-h-11 w-full items-center gap-2.5 rounded-control px-3 py-2 text-left transition hover:bg-tint/8 disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      {icon && (
        <span className={`shrink-0 ${danger ? 'text-danger-fg' : 'text-ink-soft'}`}>{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[13px] font-semibold ${danger ? 'text-danger-fg' : 'text-ink-strong'}`}
        >
          {label}
        </span>
        {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
      </span>
      {trailing}
    </button>
  )
}
