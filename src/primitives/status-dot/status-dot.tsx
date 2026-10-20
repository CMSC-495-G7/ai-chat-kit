import type { StatusDotProps } from './types'
/** A state marker; colour is supplied by the surrounding status contract. */
export function StatusDot({ size, style, className = '', ...rest }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={`rounded-full ${className}`}
      style={size === undefined ? style : { width: size, height: size, ...style }}
      {...rest}
    />
  )
}
