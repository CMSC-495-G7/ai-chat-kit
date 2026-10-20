import { useState } from 'react'
import { FilterChip, type FilterChipTone } from '../../../primitives/filter-chip'
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from '../../../primitives/icons'
import type { AskedOverChip } from '../../engine/types'
import { scopeChanged } from './scope'
import type { AskedOverStripProps } from './types'

/** Labels in the collapsed line before the rest become "+N". */
const PREVIEW = { comfortable: 2, compact: 1 } as const

/**
 * What a question was asked over, recorded on the question.
 *
 * Reads above the bubble because it qualifies it — "over these 412 items, how
 * much did we spend" — and sits outside it, because nothing is allowed to
 * reflow the sentence the person wrote.
 *
 * The chips are the rail's own `FilterChip`, minus the remove button: this is
 * a record, and there is nothing to remove from a question already asked. The
 * only action is restoring the whole set, and it acts on the rail.
 *
 * `current` is compared against, never rendered. Everything drawn here comes
 * from `scope`, the snapshot taken when the turn ran — which is what keeps a
 * week-old question telling the truth about what it was asked over.
 */
export function AskedOverStrip({
  scope,
  current,
  onRestore,
  density = 'comfortable',
  className = '',
}: AskedOverStripProps) {
  const [open, setOpen] = useState(false)
  if (scope.chips.length === 0) return null

  // No `current` means the host is not tracking scope, which is not the same
  // as "nothing is filtered now" — that is an empty array, and a real change.
  const changed = current !== undefined && scopeChanged(scope, current)

  const preview = scope.chips.slice(0, PREVIEW[density]).map(chipText)
  const rest = scope.chips.length - preview.length
  const items = `${scope.total.toLocaleString()} ${scope.total === 1 ? 'item' : 'items'}`

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        aria-label={`Filters used: ${items}${changed ? ', changed since' : ''}`}
        className={`flex max-w-[82%] items-center gap-1.5 rounded-control border px-2.5 py-0.5 transition ${
          changed
            ? 'border-caution-line bg-caution-surface hover:bg-caution-surface/70'
            : 'border-line bg-panel hover:bg-tint/8'
        } ${className}`}
      >
        <FunnelIcon width={11} height={11} className="shrink-0 text-ink-soft" />
        {/* The count and the overflow never truncate: they are the half that
            says whether the answer above is worth anything. Only the labels
            in the middle give way. */}
        <span className="shrink-0 text-[11px] font-semibold text-ink tabular-nums">{items}</span>
        {preview.length > 0 && (
          <span className="min-w-0 truncate text-[11px] text-ink-soft">
            · {preview.join(' · ')}
          </span>
        )}
        {rest > 0 && <span className="shrink-0 text-[11px] text-ink-soft/70">+{rest}</span>}
        {changed && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-caution" />}
        <ChevronDownIcon width={10} height={10} className="shrink-0 text-ink-soft/70" />
      </button>
    )
  }

  return (
    <div
      // --chip, not --highlight: the latter is the citation wash (ember, and
      // tuned per swatch), so the panel came out warm against a rail full of
      // brand blue. This is the same tint the filter chips themselves use,
      // which is the point — it is the same filters, recorded.
      className={`max-w-[82%] rounded-surface border border-accent/20 bg-chip px-3 py-2 ${className}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <FunnelIcon width={12} height={12} className="shrink-0 text-accent-fg" />
        <span className="flex-1 text-[11.5px] font-semibold text-ink-strong">
          Searched over <span className="tabular-nums">{items}</span>
        </span>
        {changed && (
          <span className="rounded-control border border-caution-line bg-caution-surface px-1.5 py-px text-[9.5px] font-bold tracking-wide text-caution uppercase">
            changed since
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide the filters used"
          className="grid size-5 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-tint/8"
        >
          <ChevronUpIcon width={11} height={11} />
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {scope.chips.map((chip, index) => (
          <FilterChip
            key={`${chip.kind}:${chip.prefix ?? ''}:${chip.label}:${index}`}
            tone={TONE[chip.kind]}
            prefix={chip.kind === 'scope' ? undefined : chip.prefix}
            label={chip.label}
            count={chip.count}
            on="tint"
          />
        ))}
      </div>

      {changed && onRestore ? (
        <button
          type="button"
          onClick={onRestore}
          className="rounded-control bg-brand-solid px-2.5 py-1 text-[11px] font-semibold text-on-brand-solid"
        >
          Use these filters again
        </button>
      ) : (
        <p className="text-[11px] text-ink-soft">These are the filters currently set.</p>
      )}
    </div>
  )
}

/** A recorded kind to the chip shape that draws it. */
const TONE: Record<AskedOverChip['kind'], FilterChipTone> = {
  scope: 'value',
  facet: 'value',
  query: 'query',
  custom: 'custom',
}

function chipText(chip: AskedOverChip): string {
  return chip.prefix && chip.kind !== 'scope' ? `${chip.prefix}: ${chip.label}` : chip.label
}
