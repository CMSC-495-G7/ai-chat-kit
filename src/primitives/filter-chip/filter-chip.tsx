import { XIcon } from '../icons'
import { IconButton } from '../icon-button'
import type { FilterChipProps } from './types'

/**
 * A single filter, as a chip.
 *
 * Shared by the filter rail, where chips can be removed, and the transcript's
 * record of what a question was asked over, where they cannot. It lives on its
 * own so neither of those has to import the other: a host can record a scope
 * without mounting the rail, and the rail knows nothing about transcripts.
 */
export function FilterChip({
  label,
  tone = 'value',
  prefix,
  count,
  onRemove,
  removeLabel,
  on = 'panel',
  className = '',
}: FilterChipProps) {
  const skin =
    tone === 'query'
      ? 'bg-brand-solid text-on-brand-solid'
      : tone === 'custom'
        ? 'border border-dashed border-line bg-panel-solid text-ink'
        : on === 'tint'
          ? 'bg-panel-solid text-chip-fg'
          : 'bg-chip text-chip-fg'

  return (
    <span
      className={`flex items-center gap-1 rounded-control py-0.5 pl-2.5 text-[11.5px] font-semibold ${
        onRemove ? 'pr-0.5' : 'pr-2.5'
      } ${skin} ${className}`}
    >
      {prefix && (
        <span className={tone === 'custom' ? 'text-ink-soft' : 'opacity-70'}>
          {tone === 'query' ? prefix : `${prefix}:`}
        </span>
      )}
      <span className="tabular-nums">{label}</span>
      {typeof count === 'number' && (
        <span className="tabular-nums opacity-70">{count.toLocaleString()}</span>
      )}
      {onRemove && (
        <IconButton
          size="sm"
          shape="rounded"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${prefix ? `${prefix} ` : ''}${label}`}
          title={removeLabel ?? `Remove ${prefix ? `${prefix} ` : ''}${label}`}
        >
          <XIcon width={11} height={11} />
        </IconButton>
      )}
    </span>
  )
}
