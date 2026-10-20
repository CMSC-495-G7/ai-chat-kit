import type { ReactNode } from 'react'
export type DescriptionListProps = {
  rows: readonly (readonly [string, ReactNode])[]
  className?: string
  rowClassName?: string
  termClassName?: string
  detailClassName?: string
}
