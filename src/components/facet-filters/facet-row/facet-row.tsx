import { Checkbox } from '../../../primitives/checkbox'
import { countLabel } from '../facetRules'
import type { FacetRowProps } from './types'

/**
 * One option. The whole row is the target because the `<label>` wraps the
 * input — a small checkbox is a legal target only in the sense that nobody
 * measured it.
 *
 * A row that cannot match is disabled rather than hidden. Removing it would
 * move everything below it in the instant someone is aiming at it, and it also
 * throws away the answer they came for: that this option is exhausted.
 */
export function FacetRow({
  row,
  refreshing,
  showCount = true,
  countText,
  resultsText = (count) => `, ${count.toLocaleString()} results`,
  onToggle,
  height,
  posInSet,
  setSize,
  style,
  index,
  tabIndex,
  onFocus,
}: FacetRowProps) {
  const dead = !row.available
  const shown = refreshing ? null : (countText?.(row.count) ?? countLabel(row.count, false))
  const spoken = showCount && typeof row.count === 'number' ? resultsText(row.count) : ''

  return (
    <li
      style={{ height, ...style }}
      data-facet-index={index}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      className="list-none"
    >
      <label
        className={`flex h-full items-center gap-2.5 rounded-control px-2 ${height ? '' : 'py-1.5'} ${
          row.selected ? 'bg-tint/6' : dead ? '' : 'hover:bg-tint/8'
        } ${dead ? 'cursor-default opacity-45' : 'cursor-pointer'}`}
      >
        <Checkbox
          tabIndex={tabIndex}
          onFocus={onFocus}
          checked={row.selected}
          disabled={dead}
          onChange={() => onToggle(row.value)}
        />
        <span
          className={`min-w-0 flex-1 truncate text-[12.5px] ${
            row.selected ? 'font-semibold text-ink-strong' : 'text-ink'
          }`}
        >
          {row.label}
        </span>
        {showCount &&
          (shown === null ? (
            <span aria-hidden className="h-2 w-6 shrink-0 rounded-full bg-line" />
          ) : (
            <span
              aria-hidden
              className={`shrink-0 text-[11.5px] tabular-nums ${
                row.selected ? 'font-semibold text-chip-fg' : 'text-ink-soft'
              }`}
            >
              {shown}
            </span>
          ))}
        <span className="sr-only">{spoken}</span>
      </label>
    </li>
  )
}
