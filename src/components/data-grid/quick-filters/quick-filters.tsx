import { CalendarIcon } from '../../../primitives/icons'
import type { QuickPick } from '../filterModel'
import type { QuickFiltersProps } from './types'

const pick =
  'inline-flex h-[26px] shrink-0 items-center gap-1.5 rounded-control border px-2.5 text-[12px] font-bold whitespace-nowrap transition'

function Pick({ item }: { item: QuickPick }) {
  return (
    <button
      type="button"
      aria-pressed={item.pressed}
      onClick={item.toggle}
      className={`${pick} ${
        item.pressed
          ? 'border-accent/50 bg-chip text-chip-fg'
          : 'border-line bg-panel-solid text-ink hover:border-accent/40'
      }`}
    >
      {item.label}
      {item.count != null && (
        <span
          className={`font-semibold tabular-nums ${item.pressed ? 'opacity-75' : 'text-ink-soft'}`}
        >
          {item.count.toLocaleString()}
        </span>
      )}
    </button>
  )
}

const heading =
  'px-2.5 pt-2 pb-1 text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase'

/**
 * What the omnibox offers while it is empty and focused: one row of picks for
 * each date and each small filter, a click apiece. The buttons are plain
 * toggles, so the omnibox's arrow keys can walk them and Tab reaches them too.
 */
export function QuickFilters({
  rows,
  datesLabel,
  valuesLabel,
  customLabel,
  onlyLabel,
  hint,
  onCustom,
  switchLabel,
  onSwitch,
}: QuickFiltersProps) {
  const dates = rows.filter((r) => r.kind === 'date')
  const rest = rows.filter((r) => r.kind !== 'date')
  const firstFlag = rest.find((r) => r.kind === 'boolean')?.id
  const render = (row: QuickFiltersProps['rows'][number]) => (
    <div
      key={row.id}
      role="group"
      aria-label={row.label}
      className="flex min-h-9 items-start gap-3 px-2.5 py-1 max-sm:flex-col max-sm:gap-1.5"
    >
      <span className="w-24 shrink-0 pt-[3px] text-[13px] font-bold text-ink-strong">
        {row.kind === 'boolean' ? (row.id === firstFlag ? onlyLabel : '') : row.label}
      </span>
      <div className="flex min-w-0 grow flex-wrap items-center gap-1.5">
        {row.picks.map((item) => (
          <Pick key={item.id} item={item} />
        ))}
        {row.kind === 'date' && onCustom && (
          <button
            type="button"
            aria-pressed={row.custom}
            onClick={() => onCustom(row.id)}
            className={`${pick} ${
              row.custom
                ? 'border-accent/50 bg-chip text-chip-fg'
                : 'border-line bg-panel-solid text-ink hover:border-accent/40'
            }`}
          >
            <CalendarIcon width={12} height={12} />
            {customLabel}
            <span className="sr-only"> {row.label}</span>
          </button>
        )}
      </div>
      {row.detail && (
        <span className="shrink-0 pt-[5px] text-[11.5px] text-ink-soft tabular-nums">
          {row.detail}
        </span>
      )}
    </div>
  )
  return (
    <div className="flex flex-col">
      {dates.length > 0 && (
        <>
          <span className={heading}>{datesLabel}</span>
          {dates.map(render)}
        </>
      )}
      {rest.length > 0 && (
        <>
          <span className={heading}>{valuesLabel}</span>
          {rest.map(render)}
        </>
      )}
      <div className="mt-1.5 flex items-center gap-3.5 border-t border-line px-2.5 pt-2 pb-1 text-[11px] text-ink-soft">
        <span>{hint}</span>
        <span>
          <kbd className="font-bold text-ink">⌫</kbd> remove last chip
        </span>
        {switchLabel && onSwitch && (
          <button
            type="button"
            onClick={onSwitch}
            className="ml-auto rounded px-1.5 py-0.5 text-[11.5px] font-bold text-brand-fg hover:bg-tint/5"
          >
            {switchLabel}
          </button>
        )}
      </div>
    </div>
  )
}
