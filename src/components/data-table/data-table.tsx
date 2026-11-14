import { withDefaults } from '../../lib/withDefaults'
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Checkbox } from '../../primitives/checkbox'
import { RADIO_CLASS } from '../../primitives/radio-group'
import { Pagination } from '../pagination'
import { Button } from '../../primitives/button'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  InboxIcon,
  RefreshIcon,
  TriangleAlertIcon,
} from '../../primitives/icons'
import { BulkBar } from './bulk-bar'
import { directionFor, isColumnSortable, toggleSort } from './sorting'
import {
  canSelectAll,
  clampSelection,
  toggleAll as toggleAllOnPage,
  toggleSelection,
} from './selection'
import { SkeletonRows, StateRow } from './states'
import { DEFAULT_TABLE_LABELS, HEADER_HEIGHT, MIN_BODY_HEIGHT, selectionLabel } from './labels'
import type { Column, DataTableLabels, DataTableProps } from './types'

/** A radio in the selection column, for `maxSelections={1}`. */
function RowRadio({
  checked,
  label,
  onPick,
}: {
  checked: boolean
  label: string
  onPick: () => void
}) {
  return (
    <span className="relative inline-grid size-6 shrink-0 place-items-center">
      <input
        type="radio"
        aria-label={label}
        checked={checked}
        onChange={onPick}
        className={RADIO_CLASS}
      />
    </span>
  )
}

const alignClass = (align: Column<unknown>['align']) =>
  align === 'end' ? 'text-right' : 'text-left'

/**
 * Written out in full rather than built from a template literal — Tailwind
 * scans source text for class names, and `hidden ${bp}:table-cell` produces
 * nothing at all in the stylesheet.
 */
const HIDE_BELOW: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
}

const hideClass = (c: { hideBelow?: Column<unknown>['hideBelow'] }) =>
  c.hideBelow ? HIDE_BELOW[c.hideBelow] : ''

/**
 * A row's click target is the row, but the row is not the control.
 *
 * `<tr>` carries an `onClick` for the mouse, and the first cell carries a real
 * `<button>` for everything else — so Tab reaches the toggle and a screen
 * reader announces it with `aria-expanded`. There is no caret: an open row says
 * so with a rail down its edge and a filled `Avatar`, and a closed one
 * underlines whatever the cell marks `data-row-title` on hover and focus. The
 * row click is convenience layered on top, never the only path, which is what
 * keeps this from being the `onClick`-on-a-div pattern it superficially
 * resembles.
 *
 * Clicks that begin inside another control — the checkbox, a row action, a
 * link — must not also toggle the row, hence the `closest` guard.
 */
const cameFromAnotherControl = (target: EventTarget | null) =>
  target instanceof Element && target.closest('button, a, input, select, textarea, label') !== null

/**
 * Which way a sortable column is sorted, as a pair of arrows.
 *
 * The arrow for the active direction is dark and the other is left grey, so the
 * column reads as "sorted this way, and could go that way" without a label. An
 * unsorted column shows the pair only while it is hovered or focused.
 */
function SortArrows({ dir }: { dir: 'asc' | 'desc' | null }) {
  const lit = 'text-ink-strong'
  const dim = 'text-ink-soft/45'
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 items-center',
        dir ? '' : 'opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ArrowUpIcon width={12} height={12} strokeWidth={2.2} className={dir === 'asc' ? lit : dim} />
      <ArrowDownIcon
        width={13}
        height={13}
        strokeWidth={2.2}
        className={`-ml-1 ${dir === 'desc' ? lit : dim}`}
      />
    </span>
  )
}

type ViewProps<T> = Omit<DataTableProps<T>, 'labels' | 'toolbar' | 'bulkActions' | 'className'> & {
  labels: DataTableLabels
  /** Replaces the empty state when nothing matched the filters; `DataGrid` passes it. */
  noMatch?: ReactNode
}

/**
 * The table and its footer, with no frame around them.
 *
 * `DataTable` puts it in a card; `DataGrid` puts it in a frame beside the
 * filter panel. Same rows, same states, either way.
 */
export function DataTableView<T>({
  columns,
  rows,
  rowId,
  rowLabel,
  caption,
  minWidth = '680px',
  actionsWidth = '128px',
  loading = false,
  skeletonRows = 5,
  sort = [],
  sortable = true,
  onSortChange,
  selectedIds,
  onSelectionChange,
  maxSelections,
  renderExpanded,
  expandedIds = [],
  onExpandedChange,
  rowActions,
  empty,
  emptyAction,
  noMatch,
  error,
  onRetry,
  minBodyHeight = MIN_BODY_HEIGHT,
  pagination,
  footer,
  labels: t,
}: ViewProps<T>) {
  const baseId = useId()

  const selectable = Boolean(onSelectionChange)
  const expandable = Boolean(renderExpanded)
  const single = maxSelections === 1
  const selected = clampSelection(selectedIds ?? [], maxSelections)

  const pageIds = rows.map(rowId)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const someSelected = selected.length > 0 && !allSelected
  const showSelectAll = canSelectAll(pageIds.length, maxSelections)

  const extraCols = (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const totalCols = columns.length + extraCols
  const nameOf = (row: T) => (rowLabel ? rowLabel(row) : rowId(row))

  // A row that spans the table must span the columns that are showing. A
  // `colSpan` of `totalCols` while `hideBelow` has hidden some of them makes a
  // fixed-layout table invent phantom columns to fit it, and the header band
  // stops short of the frame. So the span is counted from the header.
  const tableRef = useRef<HTMLTableElement>(null)
  const [visibleCols, setVisibleCols] = useState(totalCols)
  useEffect(() => {
    const table = tableRef.current
    const headerRow = table?.tHead?.rows[0]
    if (!table || !headerRow) return
    const count = () => {
      const shown = [...headerRow.cells].filter((c) => c.offsetParent !== null).length
      setVisibleCols(shown || totalCols)
    }
    count()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(count)
    observer.observe(table)
    return () => observer.disconnect()
  }, [totalCols])

  const toggleAll = () => onSelectionChange?.(toggleAllOnPage(selected, pageIds))
  const toggleRow = (id: string) =>
    onSelectionChange?.(toggleSelection(selected, id, maxSelections))

  const toggleExpanded = (id: string) =>
    onExpandedChange?.(
      expandedIds.includes(id) ? expandedIds.filter((v) => v !== id) : [...expandedIds, id],
    )

  // One radio per row picks on a row click too: there is nothing else for the row to do.
  const rowClick = expandable
    ? (id: string) => toggleExpanded(id)
    : selectable && single
      ? (id: string) => toggleRow(id)
      : null

  const floor = minBodyHeight === 'none' ? undefined : minBodyHeight

  const message = () => {
    if (error) {
      return (
        <StateRow
          colSpan={visibleCols}
          tone="danger"
          icon={<TriangleAlertIcon width={20} height={20} />}
          title={t.errorTitle}
          body={error === true ? t.errorBody : error}
          minHeight={floor}
          actions={
            onRetry && (
              <Button size="sm" onClick={onRetry} icon={<RefreshIcon width={14} height={14} />}>
                {t.retry}
              </Button>
            )
          }
        />
      )
    }
    if (noMatch) {
      return (
        <tr>
          <td colSpan={visibleCols} className="p-0">
            {noMatch}
          </td>
        </tr>
      )
    }
    if (empty) {
      return (
        <tr>
          <td colSpan={visibleCols} className="p-0">
            <div
              className="flex flex-col items-center justify-center px-6 py-12"
              style={floor ? { minHeight: floor } : undefined}
            >
              {empty}
            </div>
          </td>
        </tr>
      )
    }
    return (
      <StateRow
        colSpan={visibleCols}
        icon={<InboxIcon width={20} height={20} />}
        title={t.emptyTitle}
        body={t.emptyBody}
        actions={emptyAction}
        minHeight={floor}
      />
    )
  }

  return (
    <div className="flex min-w-0 grow flex-col">
      {/* `relative`, so visually hidden text in a cell (the actions header) is placed against
          this box and scrolls with it. Without it, that text is placed against the page, and a
          table wider than the screen makes the whole page scroll sideways. */}
      <div
        className="relative min-w-0 grow overflow-x-auto"
        // The floor holds for a short page and while loading too, so the frame keeps one
        // height whether rows, skeletons or a message fill it.
        style={floor ? { minHeight: `calc(${floor} + ${HEADER_HEIGHT})` } : undefined}
      >
        <table
          ref={tableRef}
          className="w-full table-fixed border-collapse text-left"
          style={minWidth === 'none' ? undefined : { minWidth }}
        >
          <caption className="sr-only">{caption}</caption>

          <thead>
            <tr className="border-b border-line bg-canvas">
              {selectable && (
                <th scope="col" style={{ width: '44px' }} className="px-4 py-0">
                  {showSelectAll ? (
                    <Checkbox
                      aria-label={t.selectAll}
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                    />
                  ) : (
                    <span className="sr-only">{t.selectRow('').trim()}</span>
                  )}
                </th>
              )}
              {columns.map((c) => {
                // One question, asked in one place: a column that cannot sort shows no
                // button, no arrows and no aria-sort, even if the host's sort names it.
                const canSort = isColumnSortable(c, sortable && Boolean(onSortChange))
                const dir = canSort ? directionFor(c.sortKey, sort) : null
                const head = (
                  <span className="min-w-0 truncate text-[10.5px] font-extrabold tracking-[0.07em] uppercase">
                    {c.header}
                  </span>
                )
                return (
                  <th
                    key={c.id}
                    scope="col"
                    style={c.width ? { width: c.width } : undefined}
                    aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={[
                      'h-11 truncate px-4 align-middle whitespace-nowrap text-ink-soft',
                      alignClass(c.align),
                      hideClass(c),
                      c.headerClassName ?? '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => onSortChange?.(toggleSort(c.sortKey!, sort))}
                        title={t.sortBy(String(c.header))}
                        className={[
                          'group inline-flex max-w-full items-center gap-1 transition hover:text-ink-strong',
                          dir ? 'text-ink-strong' : '',
                          c.align === 'end' ? 'flex-row-reverse' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {head}
                        <SortArrows dir={dir} />
                      </button>
                    ) : (
                      head
                    )}
                  </th>
                )
              })}

              {rowActions && (
                <th scope="col" style={{ width: actionsWidth }} className="px-4">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <SkeletonRows
                rows={skeletonRows}
                columns={totalCols}
                cellClasses={[
                  ...(selectable ? [''] : []),
                  ...columns.map(hideClass),
                  ...(rowActions ? [''] : []),
                ]}
              />
            )}

            {!loading && (error || rows.length === 0) && message()}

            {!loading &&
              !error &&
              rows.map((row) => {
                const id = rowId(row)
                const isOpen = expandedIds.includes(id)
                const isSelected = selected.includes(id)
                const panelId = `${baseId}-panel-${id}`
                const [first, ...rest] = columns

                return (
                  <Fragment key={id}>
                    <tr
                      data-open={isOpen}
                      data-selected={isSelected}
                      onClick={
                        rowClick
                          ? (e) => {
                              if (!cameFromAnotherControl(e.target)) rowClick(id)
                            }
                          : undefined
                      }
                      className={[
                        'group/row border-b border-line/70 transition',
                        isOpen
                          ? 'shadow-[inset_3px_0_0_var(--brand-solid)] [&_[data-avatar]]:bg-brand-solid [&_[data-avatar]]:text-on-brand-solid'
                          : isSelected
                            ? 'bg-chip/50'
                            : 'hover:bg-tint/4',
                        !isOpen &&
                          'hover:[&_[data-row-title]]:underline has-[button:focus-visible]:[&_[data-row-title]]:underline [&_[data-row-title]]:decoration-ink-soft/40 [&_[data-row-title]]:decoration-[1.5px] [&_[data-row-title]]:underline-offset-4',
                        rowClick ? 'cursor-pointer' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {selectable && (
                        <td className="px-4">
                          {single ? (
                            <RowRadio
                              label={t.selectRow(nameOf(row))}
                              checked={isSelected}
                              onPick={() => toggleRow(id)}
                            />
                          ) : (
                            <Checkbox
                              aria-label={t.selectRow(nameOf(row))}
                              checked={isSelected}
                              onChange={() => toggleRow(id)}
                            />
                          )}
                        </td>
                      )}

                      <td
                        className={[
                          'h-13 overflow-hidden px-4 text-[13.5px] text-ink',
                          alignClass(first.align),
                          hideClass(first),
                          first.cellClassName ?? '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {expandable ? (
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => toggleExpanded(id)}
                            className="w-full text-left"
                          >
                            {first.cell(row)}
                          </button>
                        ) : (
                          first.cell(row)
                        )}
                      </td>

                      {rest.map((c) => (
                        <td
                          key={c.id}
                          className={[
                            'h-13 overflow-hidden px-4 text-[13.5px] text-ink',
                            alignClass(c.align),
                            hideClass(c),
                            c.cellClassName ?? '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {c.cell(row)}
                        </td>
                      ))}

                      {rowActions && (
                        <td className="px-3">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 transition group-hover/row:opacity-100 group-data-[open=true]/row:opacity-100 group-data-[selected=true]/row:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                            {rowActions(row)}
                          </div>
                        </td>
                      )}
                    </tr>

                    {expandable && isOpen && (
                      <tr className="border-b border-line bg-canvas shadow-[inset_3px_0_0_var(--brand-solid)]">
                        <td
                          id={panelId}
                          colSpan={visibleCols}
                          className="px-4 py-4"
                          style={selectable ? { paddingLeft: 'calc(44px + 1rem)' } : undefined}
                        >
                          {renderExpanded?.(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalElements > 0 && (
        <Pagination
          {...pagination}
          totalPages={
            pagination.totalPages ??
            Math.max(1, Math.ceil(pagination.totalElements / Math.max(1, pagination.size)))
          }
          busy={loading}
        />
      )}
      {footer}
    </div>
  )
}

/**
 * The table.
 *
 * Controlled and inert, like everything else in the library: it fetches
 * nothing, sorts nothing and remembers nothing. `rows` are already the page,
 * `sort` is already applied, selection and expansion are the host's. That is
 * what lets one fixture and one live endpoint satisfy the same props.
 *
 * A real `<table>` rather than a grid of divs. Row and column relationships
 * are what a screen reader navigates a table by, and `role="…"` sprinkled on
 * divs reproduces them only if every role is right — which is a worse bet than
 * the element that has them for free.
 *
 * For search, filters and export around it, use `DataGrid`.
 */
export function DataTable<T>({
  toolbar,
  bulkActions,
  labels,
  className = '',
  ...props
}: DataTableProps<T>) {
  const t = withDefaults(DEFAULT_TABLE_LABELS, labels)
  const selected = clampSelection(props.selectedIds ?? [], props.maxSelections)

  return (
    <div className={['flex min-w-0 flex-col gap-3', className].filter(Boolean).join(' ')}>
      {toolbar}

      {props.onSelectionChange && selected.length > 0 && (
        <BulkBar
          countLabel={selectionLabel(
            t,
            selected,
            props.rows,
            props.rowId,
            props.rowLabel,
            props.maxSelections,
          )}
          clearLabel={t.clearSelection}
          onClear={() => props.onSelectionChange?.([])}
        >
          {bulkActions}
        </BulkBar>
      )}

      <div className="flex min-w-0 flex-col overflow-hidden rounded-surface border border-line bg-panel-solid">
        <DataTableView {...props} labels={t} />
      </div>
    </div>
  )
}
