# DataTable sorting

The table sorts nothing itself. A header becomes a button, the host gets the new
`Sort[]`, and the rows it passes back are already in order. What the table adds is
which columns may sort, how values compare, and a request that never names a field
the backend cannot order by.

## Which columns sort

A column sorts when it has a `sortKey`, and neither it nor the table has switched
sorting off.

| Setting                         | Effect                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `sortKey: 'created_at'`         | The header is a button. The key is what goes on the wire, and is often the API's name, not the column's `id`.                |
| `sortable: false`               | Keeps the key and turns the column off: no button, no arrows, never in the request. For a field the backend cannot order by. |
| `sortable={false}` on the table | Every column off, for an endpoint that takes no `sort` at all.                                                               |

A sort in the host's state that names a column that is off is ignored: no arrows, no
`aria-sort`, rows as they came. `isColumnSortable` is the one place that decides, and the
header, `sortRows` and `toSortParam` all ask it.

## Server-side, or all rows in the browser

```ts
// Paged: ask the server, and leave the parameter off when nothing enabled is sorted.
const sort = toSortParam(state, columns)
fetch(`/api/tenants?page=1${sort ? `&sort=${sort}` : ''}`)

// Everything loaded: sort here, with the same columns.
const rows = sortRows(all, state, columns)
```

Both read the same `columns`, so a column switched off is off for both.

## How values compare (`sortRows`)

`sortType` says how, and defaults to `text`.

| `sortType` | Compares                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `text`     | Without regard to case or accents, and numbers inside text as numbers: "Suite 2" before "Suite 10". |
| `number`   | As numbers, so 88 comes before 412. Numeric strings are read; "n/a" counts as missing.              |
| `date`     | As moments. ISO strings, `Date` objects and epoch numbers all work; unreadable counts as missing.   |

A row with nothing to compare goes last whichever way the column sorts, because
"unknown" is neither the smallest nor the largest. Equal rows keep the order they came in.
`sortValue` reads the value when the column shows something derived, such as seats in use out
of a `[used, total]` pair, or when `sortKey` is not a property of the row.

`sortRows` returns the same array when there is nothing to sort by, and never changes the one it
was given.
