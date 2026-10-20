import type { SkeletonProps } from './types'
export function Skeleton({ className = '', ...rest }: SkeletonProps) {
  return <span className={`block animate-pulse rounded bg-tint/12 ${className}`} {...rest} />
}
