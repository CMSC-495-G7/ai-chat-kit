import type { HighlightPickerProps } from '../types'

/**
 * Pick the `<mark>` colour behind a cited passage — the reference panel and a
 * citation chip's hover preview both use it.
 *
 * The swatches are real `--highlight` values from brand.css §5 rather than
 * approximate dots, so what is shown here is what lands on the page.
 */
export function HighlightPicker({
  options,
  value,
  onChange,
  title = 'Citation highlight',
  description = 'Every swatch keeps marked text above 7:1. They differ in how clearly the wash reads — yellow is the faintest on a light panel, and the strongest on a dark one.',
}: HighlightPickerProps) {
  if (options.length === 0) return null

  return (
    <section className="mt-1 border-t border-line pt-4">
      <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
        {title}
      </h3>
      {description && <p className="mt-1 text-xs leading-snug text-ink-soft">{description}</p>}
      <div role="radiogroup" aria-label={title} className="mt-2.5 flex gap-2">
        {options.map(({ id, label, swatch }) => {
          const on = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(id)}
              title={label}
              aria-label={label}
              // The ring, not the fill, carries selection: two of these hues
              // are close enough that a brightness change alone would not read.
              className={`grid size-8 shrink-0 place-items-center rounded-full transition ${
                on ? 'ring-2 ring-accent ring-offset-2 ring-offset-panel-solid' : 'hover:bg-tint/8'
              }`}
            >
              <span
                aria-hidden
                style={{ background: swatch }}
                className="size-5 rounded-full ring-1 ring-ink-soft/25"
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
