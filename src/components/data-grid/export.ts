// Turning rows into a file. The grid never calls these itself: `onExport` is the
// host's, because "every matching row" usually lives on a server, not in the
// page. For a host that has all its rows in hand, these do the whole job.

/** One column of an export: its heading and how to read its value from a row. */
export type ExportColumn<T> = {
  key: string
  header: string
  /** Defaults to the row's `key` property. */
  value?: (row: T) => unknown
}

const read = <T>(row: T, column: ExportColumn<T>) =>
  column.value ? column.value(row) : (row as Record<string, unknown>)[column.key]

const plain = (value: unknown): string => {
  if (value == null) return ''
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(plain).join('; ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * One CSV cell. Quoted when it holds a comma, a quote or a line break.
 *
 * Text that starts with `=`, `+`, `-` or `@` gets a leading apostrophe, so a
 * spreadsheet shows it rather than running it as a formula. Numbers are left
 * alone: -5 is a number, not a formula.
 */
function csvCell(value: unknown): string {
  let text = plain(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Rows as CSV, with a header line. Lines end in CRLF, which every spreadsheet reads. */
export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const lines = [columns.map((c) => csvCell(c.header)).join(',')]
  for (const row of rows) lines.push(columns.map((c) => csvCell(read(row, c))).join(','))
  return lines.join('\r\n')
}

/**
 * Rows as a JSON array of objects, keyed by each column's `key`. Pass no
 * columns to write the rows exactly as they are.
 */
export function toJson<T>(rows: T[], columns?: ExportColumn<T>[]): string {
  const out = columns
    ? rows.map((row) => Object.fromEntries(columns.map((c) => [c.key, read(row, c) ?? null])))
    : rows
  return JSON.stringify(out, null, 2)
}

/** The MIME type for a built-in format. */
export const EXPORT_MIME: Record<string, string> = {
  csv: 'text/csv;charset=utf-8',
  json: 'application/json',
}

/** Saves text as a file in the browser: `downloadFile('tenants.csv', toCsv(...), 'text/csv')`. */
export function downloadFile(name: string, content: string, type = 'text/plain'): void {
  // A BOM, so Excel reads a UTF-8 CSV as UTF-8 and accented names survive.
  const body = type.startsWith('text/csv') ? `﻿${content}` : content
  const url = URL.createObjectURL(new Blob([body], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * The whole export in one call, for a host with the rows in hand:
 * `onExport={(format, scope) => downloadRows('tenants', format, pick(scope), COLUMNS)}`.
 * `csv` writes CSV, anything else JSON.
 */
export function downloadRows<T>(
  name: string,
  format: string,
  rows: T[],
  columns: ExportColumn<T>[],
): void {
  const csv = format === 'csv'
  downloadFile(
    `${name}.${csv ? 'csv' : 'json'}`,
    csv ? toCsv(rows, columns) : toJson(rows, columns),
    EXPORT_MIME[csv ? 'csv' : 'json'],
  )
}
