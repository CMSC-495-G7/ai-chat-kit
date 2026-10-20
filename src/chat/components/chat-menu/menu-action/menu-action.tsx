import type { MenuActionProps } from './types'
export function MenuAction({ icon, label, collapsed }: MenuActionProps) {
  return (
    <button
      type="button"
      title={label}
      className={`flex w-full items-center gap-2.5 rounded-control px-2 py-2 text-sm font-medium text-ink transition hover:bg-panel ${
        collapsed ? 'lg:justify-center' : ''
      }`}
    >
      <span className="shrink-0 text-ink-soft">{icon}</span>
      <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
    </button>
  )
}
