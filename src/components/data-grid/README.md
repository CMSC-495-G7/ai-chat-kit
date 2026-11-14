# DataGrid

A table with its search, filters, selection and export, as one component. It
takes every `DataTable` prop, plus these.

```tsx
<DataGrid
  searchLabel="Search and filter tenants"
  caption="Tenants"
  columns={columns}
  rows={pageRows}
  rowId={(t) => t.id}
  rowLabel={(t) => t.name}
  fields={fields}              // what the panel, chips and quick picks draw
  terms={terms}                // searches, narrowings, values picked from the data
  onTermsChange={setTerms}
  termFields={TERM_FIELDS}     // what typing can narrow to and find values in
  onReset={resetFields}
  defaultOpen
  defaultPinned
  selectedIds={selected}
  onSelectionChange={setSelected}
  maxSelections={3}
  exportFormats={['csv', 'json']}
  onExport={(format, scope) => …}
  pagination={{ page, size, totalElements, onPageChange: setPage, onSizeChange: setSize, sizeOptions: [10, 25, 50] }}
/>
```

## The search box

| You do                    | It shows                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Click it while it's empty | Quick picks: a row per date (its short presets) and per filter with six options or fewer.                                        |
| Type "bay"                | Matches from the data ("Bayshore Financial" in Name), matching filters and dates, then search every field and narrow to a field. |
| Press Enter               | The top suggestion becomes a chip and the menu closes.                                                                           |
| Click it again            | The quick picks.                                                                                                                 |
| Backspace while empty     | Removes the last chip.                                                                                                           |

A value picked from the data is a term with `exact: true` (its chip says "name
is"). Filter it as an exact match. Matches come from `rows` by default; pass
`findMatches` to look through every row, or ask a server, or `false` for none.

## The panel

Unpinned, it floats under the toolbar. Pinned, it is the grid's first column, in
the same frame as the table and always the same height: its fields scroll
inside, so the table alone decides how tall the grid is. Below `lg` it sits above
the table.

## Selection

`maxSelections={1}` draws radio buttons: a new pick, or a click on the row,
replaces the old one. A larger limit keeps the latest picks and drops the
oldest. Select-all only shows when the page fits under the limit.

## Export

One format and no selection: a plain "Export CSV" button. Two formats, or rows
selected: a menu, which with a selection asks for selected or all matching rows.
The grid builds no file. `toCsv`, `toJson` and `downloadFile` do it for rows in
hand.

## Pagination

`pagination` draws pages and rows per page under the rows, with the same props
as `Pagination`. `totalPages` is worked out from `totalElements` and `size` when
left out; leave out `onSizeChange` to hide rows per page. It dims while
`loading` and hides while there are no rows at all.

## States

The rows area is never shorter than `minBodyHeight` (`22rem`), so loading,
nothing yet (`emptyAction`), no match (filters on, listed as chips with Clear
all) and an error (`error`, `onRetry`) all keep the same frame.
