import type { HTMLAttributes, ReactNode } from 'react'
export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  body?: ReactNode
  titleClassName?: string
  bodyClassName?: string
}
