// Rows, columns and fields for the DataGrid stories.
import { STATUS_LABEL, STATUS_TONE, TENANTS, fmtDate, type Tenant } from '../../fixtures/tenants'
import { Avatar } from '../../primitives/avatar'
import { Pill } from '../../primitives/pill'
import type { Column } from '../data-table'
import type { ExportColumn } from './export'
import type { FilterTermField } from './types'

type FieldKey = 'name' | 'contact' | 'email'

/** `yyyy-mm-dd`, `offset` days from today, so the date quick picks always have something to find. */
export const day = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The fixture, with its created dates moved to the last few months. */
export const ROWS: Tenant[] = TENANTS.map((t, i) => ({ ...t, created: day(-(i * 9 + 2)) }))

export const TERM_FIELDS: (FilterTermField & { key: FieldKey })[] = [
  { key: 'name', label: 'Name', glyph: 'Aa', param: 'name__icontains' },
  { key: 'contact', label: 'Primary contact', glyph: '◔', param: 'contact__icontains' },
  { key: 'email', label: 'Email', glyph: '@', param: 'email__icontains' },
]

export const COLUMNS: Column<Tenant>[] = [
  {
    id: 'name',
    header: 'Name',
    sortKey: 'name',
    width: '30%',
    cell: (t) => (
      <span className="flex items-center gap-2.5">
        <Avatar variant="text" text={t.initials} size={28} tone="soft" aria-hidden />
        <span data-row-title className="truncate font-bold text-ink-strong">
          {t.name}
        </span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortKey: 'status',
    width: '120px',
    cell: (t) => (
      <Pill tone={STATUS_TONE[t.status]} variant="outline" size="sm">
        {STATUS_LABEL[t.status]}
      </Pill>
    ),
  },
  {
    id: 'tier',
    header: 'Tier',
    sortKey: 'tier',
    width: '112px',
    hideBelow: 'md',
    cell: (t) => t.tier,
  },
  {
    id: 'contact',
    header: 'Primary contact',
    sortKey: 'contact',
    hideBelow: 'lg',
    cell: (t) => <span className="block truncate">{t.contact}</span>,
  },
  {
    id: 'created',
    header: 'Created',
    sortKey: 'created',
    sortType: 'date',
    width: '128px',
    hideBelow: 'md',
    cell: (t) => <span className="whitespace-nowrap text-ink-soft">{fmtDate(t.created)}</span>,
  },
]

export const EXPORT_COLUMNS: ExportColumn<Tenant>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'status', header: 'Status', value: (t) => STATUS_LABEL[t.status] },
  { key: 'tier', header: 'Tier' },
  { key: 'contact', header: 'Primary contact' },
  { key: 'email', header: 'Email' },
  { key: 'created', header: 'Created' },
]
