import type { StatTileProps } from './types'
export function StatTile({
  value,
  label,
  className = '',
  valueClassName = 'text-[28px] leading-tight font-normal text-ink-strong tabular-nums',
  labelClassName = 'mt-1 text-sm text-ink-soft',
}: StatTileProps) {
  return (
    <div className={className}>
      <span className={valueClassName}>{value}</span>
      <span className={labelClassName}>{label}</span>
    </div>
  )
}
