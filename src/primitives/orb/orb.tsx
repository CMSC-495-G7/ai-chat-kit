import type { OrbProps } from './types'
/** Brand mark: a face on a rounded brand tile (`.orb` in tokens.css). The
 *  caller keeps the size and motion appropriate to its surface. */
export function Orb({ className = '', ...rest }: OrbProps) {
  return <span aria-hidden className={`orb ${className}`} {...rest} />
}
