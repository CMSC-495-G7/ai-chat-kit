import type { OrbProps } from './types'
/** Brand mark. The caller keeps the size and motion appropriate to its surface. */
export function Orb({ className = '', ...rest }: OrbProps) {
  return <span aria-hidden className={`orb rounded-full ${className}`} {...rest} />
}
