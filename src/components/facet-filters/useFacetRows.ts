import { useMemo, useRef } from 'react'
import { toRows } from './facetRules'
import type { FacetGroup } from './types'

type Option = ReturnType<typeof toRows>[number] & { searchText: string }

/** Preserve existing option order across count refreshes; append genuinely new values. */
export function useFacetRows(
  group: FacetGroup,
  selected: string[],
  query: string,
  serverFiltered: boolean,
) {
  const { key, values, nullable, nullValue, nullLabel, label } = group
  const previous = useRef<{ key: string; options: Option[] }>({ key: group.key, options: [] })
  const options = useMemo(() => {
    const next = new Map(
      toRows({ key, values, nullable, nullValue, nullLabel, label }, []).map((row) => [
        row.value,
        row,
      ]),
    )
    const ordered: Option[] = []
    const old = previous.current.key === key ? previous.current.options : []
    for (const option of old) {
      const row = next.get(option.value)
      if (!row) continue
      ordered.push({
        ...row,
        searchText:
          row.label === option.label
            ? option.searchText
            : `${row.label}\n${row.value}`.toLowerCase(),
      })
      next.delete(option.value)
    }
    for (const row of next.values()) {
      ordered.push({ ...row, searchText: `${row.label}\n${row.value}`.toLowerCase() })
    }
    previous.current = { key, options: ordered }
    return ordered
  }, [key, values, nullable, nullValue, nullLabel, label])

  return useMemo(() => {
    const picks = new Set(selected)
    const q = serverFiltered ? '' : query.trim().toLowerCase()
    return options
      .filter((option) => !q || option.searchText.includes(q))
      .map((option) => ({
        ...option,
        selected: picks.has(option.value),
        available: option.available || picks.has(option.value),
      }))
  }, [options, selected, query, serverFiltered])
}
