import type { Page, Sort, SortDirection } from './types'

/**
 * Backend envelopes → the one `Page` shape the UI works in.
 *
 * Three are shipped because the same table is meant to sit in front of three
 * stacks. They differ only in where the numbers live; every one of them ends
 * up 1-based here (see `Page`).
 */

const asDirection = (value: unknown): SortDirection =>
  String(value).toLowerCase() === 'desc' ? 'desc' : 'asc'

/**
 * Sort arrives in more shapes than anything else in these envelopes: Django
 * hands back whatever `sort_info` was built as, Spring sends objects, and a
 * hand-rolled Node endpoint usually sends the raw `sort=name,asc` string.
 * All of them are accepted; anything unreadable becomes no sort rather than a
 * thrown error, because a mis-sorted table is recoverable and a crashed one is
 * not.
 */
export function parseSort(raw: unknown): Sort[] {
  if (!raw) return []

  // "name,asc" or "name,asc;created,desc"
  if (typeof raw === 'string') {
    return raw
      .split(';')
      .map((clause) => clause.trim())
      .filter(Boolean)
      .map((clause) => {
        const [field, direction] = clause.split(',')
        return { field: field.trim(), direction: asDirection(direction) }
      })
      .filter((s) => s.field.length > 0)
  }

  if (Array.isArray(raw)) return raw.flatMap((entry) => parseSort(entry))

  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const field = o.field ?? o.property ?? o.key ?? o.name
    if (typeof field !== 'string' || !field) return []
    return [{ field, direction: asDirection(o.direction ?? o.order ?? o.dir) }]
  }

  return []
}

/** `sort=` query-param form. The inverse of `parseSort`. */
export const formatSort = (sort: Sort[]): string =>
  sort.map((s) => `${s.field},${s.direction}`).join(';')

/** Derived rather than trusted: `first`/`last` are cheap to get wrong server-side. */
const fill = <T>(
  p: Omit<Page<T>, 'first' | 'last'> & Partial<Pick<Page<T>, 'first' | 'last'>>,
): Page<T> => ({
  ...p,
  first: p.first ?? p.page <= 1,
  last: p.last ?? p.page >= p.totalPages,
})

/**
 * Our Django envelope.
 *
 * ```json
 * { "success": true, "data": { "content": [], "first": true, "last": false,
 *   "page": { "elements": 10, "number": 0, "offset": 1, "size": 10 },
 *   "total": { "elements": 1284, "pages": 129 }, "sort": [] } }
 * ```
 *
 * `page.number` is 0-based and `page.offset` is 1-based — Django's
 * `start_index()` — so the `+ 1` below is the only place that discrepancy is
 * handled. Accepts the bare `data` object as well as the full envelope, so a
 * caller that already unwrapped `success`/`message` does not have to re-wrap.
 */
export function djangoPageAdapter<T>(envelope: unknown): Page<T> {
  const root = (envelope ?? {}) as Record<string, unknown>
  const d = (root.data ?? root) as Record<string, unknown>
  const pageInfo = (d.page ?? {}) as Record<string, unknown>
  const total = (d.total ?? {}) as Record<string, unknown>

  const content = Array.isArray(d.content) ? (d.content as T[]) : []
  const size = Number(pageInfo.size) || content.length || 0

  return fill<T>({
    content,
    page: Number(pageInfo.number ?? 0) + 1,
    size,
    elements: Number(pageInfo.elements ?? content.length),
    offset: Number(pageInfo.offset ?? 1),
    totalElements: Number(total.elements ?? content.length),
    totalPages: Number(total.pages ?? 1),
    sort: parseSort(d.sort),
    first: typeof d.first === 'boolean' ? d.first : undefined,
    last: typeof d.last === 'boolean' ? d.last : undefined,
  })
}

/**
 * Spring Data `Page` (Java). Zero-based `number`, and no offset of its own —
 * it is computed, which is safe because Spring's `number`/`size` are
 * authoritative.
 */
export function springPageAdapter<T>(envelope: unknown): Page<T> {
  const p = (envelope ?? {}) as Record<string, unknown>
  const content = Array.isArray(p.content) ? (p.content as T[]) : []
  const number = Number(p.number ?? 0)
  const size = Number(p.size) || content.length || 0

  return fill<T>({
    content,
    page: number + 1,
    size,
    elements: Number(p.numberOfElements ?? content.length),
    offset: number * size + 1,
    totalElements: Number(p.totalElements ?? content.length),
    totalPages: Number(p.totalPages ?? 1),
    sort: parseSort(p.sort),
    first: typeof p.first === 'boolean' ? p.first : undefined,
    last: typeof p.last === 'boolean' ? p.last : undefined,
  })
}

/**
 * The flat shape a Node service usually returns: rows plus a total, with the
 * page already 1-based. `items` / `results` / `data` / `content` are all
 * accepted for the rows key, because that one is never the same twice.
 */
export function plainPageAdapter<T>(envelope: unknown): Page<T> {
  const p = (envelope ?? {}) as Record<string, unknown>
  const rows = p.items ?? p.results ?? p.data ?? p.content
  const content = Array.isArray(rows) ? (rows as T[]) : []

  const page = Number(p.page ?? 1) || 1
  const size = Number(p.size ?? p.limit ?? p.perPage) || content.length || 0
  const totalElements = Number(p.total ?? p.count ?? content.length)
  const totalPages = Number(p.totalPages ?? (size > 0 ? Math.ceil(totalElements / size) : 1)) || 1

  return fill<T>({
    content,
    page,
    size,
    elements: content.length,
    offset: Number(p.offset ?? (page - 1) * size + 1),
    totalElements,
    totalPages,
    sort: parseSort(p.sort),
  })
}

/** An already-loaded array as a single page — for fixtures and demos. */
export function staticPage<T>(rows: T[], sort: Sort[] = []): Page<T> {
  return {
    content: rows,
    page: 1,
    size: rows.length,
    elements: rows.length,
    offset: rows.length > 0 ? 1 : 0,
    first: true,
    last: true,
    totalElements: rows.length,
    totalPages: 1,
    sort,
  }
}
