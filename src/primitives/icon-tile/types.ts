import type { HTMLAttributes } from 'react'
export type IconTileProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'soft' | 'chip' | 'plain' | 'muted' | 'warning'
  size?: number
}
