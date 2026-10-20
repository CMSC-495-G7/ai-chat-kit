import type { PalettePickerProps } from '../types'

/**
 * Pick a `chat-theme-*` palette.
 *
 * Each tile is a real preview rather than a label — the plate is the theme's
 * own dark canvas, the bar its dark panel, the dot the ember `--action` fill
 * those surfaces exist to set off. See PaletteOption for why those are
 * literals and why they are dark values in both modes.
 */
export function PalettePicker({
  options,
  value,
  onChange,
  title = 'Palette',
  description = 'Light mode is near-identical across these. What changes is the dark field — how much colour it carries, and how dark it goes.',
}: PalettePickerProps) {
  if (options.length === 0) return null
  const active = options.find((o) => o.id === value)
  // Up to five tiles share one row; past that a label like "Graphite" no
  // longer fits, so the tiles wrap into two balanced rows (6 → 3 + 3).
  const columns = options.length <= 5 ? options.length : Math.ceil(options.length / 2)

  return (
    <section className="mt-1 border-t border-line pt-4">
      <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
        {title}
      </h3>
      {description && <p className="mt-1 text-xs leading-snug text-ink-soft">{description}</p>}
      <div
        role="radiogroup"
        aria-label={title}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        className="mt-2.5 grid gap-2"
      >
        {options.map(({ id, label, canvas, panel, action }) => {
          const on = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(id)}
              className={`min-w-0 rounded-surface p-1.5 transition ${
                on ? 'ring-2 ring-accent ring-offset-2 ring-offset-panel-solid' : 'hover:bg-tint/8'
              }`}
            >
              <span
                aria-hidden
                style={{ background: canvas }}
                className="relative flex h-12 w-full items-end justify-end overflow-hidden rounded-control p-1.5 ring-1 ring-ink-soft/25"
              >
                <span
                  style={{ background: panel }}
                  className="absolute inset-x-1.5 top-1.5 h-4 rounded"
                />
                <span style={{ background: action }} className="relative size-3.5 rounded-full" />
              </span>
              <span
                className={`mt-1.5 block truncate text-[12px] font-medium ${
                  on ? 'text-ink-strong' : 'text-ink-soft'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
      {active?.hint && <p className="mt-2 text-xs leading-snug text-ink-soft">{active.hint}</p>}
    </section>
  )
}
