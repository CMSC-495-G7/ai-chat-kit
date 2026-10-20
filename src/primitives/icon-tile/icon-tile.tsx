import type { IconTileProps } from './types'
const tones = {
  soft: 'rounded-full bg-tint/5 text-brand-fg',
  chip: 'rounded-control bg-chip text-chip-fg',
  plain: 'text-ink-soft',
  muted: 'rounded-control bg-tint/6 text-ink-soft',
  warning: 'rounded-control bg-caution-surface text-caution',
}
export function IconTile({
  tone = 'soft',
  size = 32,
  className = '',
  style,
  ...rest
}: IconTileProps) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center ${tones[tone]} ${className}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    />
  )
}
