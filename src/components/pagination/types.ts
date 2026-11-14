import type { HTMLAttributes } from 'react'
import type { PageWindowOptions } from './pageWindow'

export type PaginationLabels = {
  label?: string
  rows: string
  previous: string
  next: string
  /** `(from, to, total)` → "41–50 of 1,284". */
  range: (from: number, to: number, total: number) => string
  page: (n: number) => string
}

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, 'onChange'> &
  PageWindowOptions & {
    /** 1-based, as everywhere in the paging model. */
    page: number
    size: number
    totalElements: number
    totalPages: number
    /** 1-based index of the first row on this page. Derived when absent. */
    offset?: number
    /** Rows on this page. Derived when absent. */
    elements?: number
    sizeOptions?: number[]
    onPageChange: (page: number) => void
    /** Omit to hide the rows-per-page control entirely. */
    onSizeChange?: (size: number) => void
    /** Drops the numbered rail, leaving the readout and Prev/Next. */
    compact?: boolean
    /** Dims the controls without unmounting them, while a page is in flight. */
    busy?: boolean
    labels?: Partial<PaginationLabels>
  }
