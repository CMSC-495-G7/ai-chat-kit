/**
 * The paging model the UI works in — one shape, whatever the backend speaks.
 *
 * Every adapter in `adapters.ts` normalises to this, so a component never sees
 * a vendor envelope and never does arithmetic on a page number.
 */

export type SortDirection = 'asc' | 'desc'

/** One ordering clause. The wire form is `field,direction` (`name,asc`). */
export type Sort = {
  field: string
  direction: SortDirection
}

/**
 * One page of rows, normalised.
 *
 * ## The page-number trap
 *
 * Our Django envelope is inconsistent with itself on purpose — it mirrors
 * Spring's `Pageable`, which numbers pages from zero, while Django's own
 * paginator numbers from one:
 *
 * ```py
 * 'number': self.page.number - 1,        # 0-based
 * 'offset': self.page.start_index(),     # 1-based
 * ```
 *
 * and the *request* takes `?page=1`, which is 1-based again. That is three
 * conventions in one round trip.
 *
 * So `page` here is **1-based**, matching both the query param and what a
 * person reads off the screen, and the adapter is the single place the
 * conversion happens. No component adds or subtracts one — if you find
 * yourself writing `page - 1` in a component, the adapter is wrong.
 */
export type Page<T> = {
  content: T[]
  /** 1-based. See the note above. */
  page: number
  /** Rows requested per page. */
  size: number
  /** Rows actually on this page — the last page is usually short. */
  elements: number
  /** 1-based index of the first row on this page, for "41–50 of 1,284". */
  offset: number
  first: boolean
  last: boolean
  /** Rows across every page. */
  totalElements: number
  totalPages: number
  sort: Sort[]
}

/** What the table asks for. `page` is 1-based, as in `Page`. */
export type PageRequest = {
  page: number
  size: number
  sort: Sort[]
}

/**
 * Normalises one backend envelope into a `Page`.
 *
 * Written as an interface rather than a union of known shapes so a host can
 * pass its own for a backend we do not ship — the table only ever sees `Page`.
 */
export type PageAdapter<TEnvelope = unknown> = <T>(envelope: TEnvelope) => Page<T>
