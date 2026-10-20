import { useCallback, useEffect, useId, useLayoutEffect, useState } from 'react'
import { FacetRow } from './facet-row'
import { FACET_ROW_HEIGHT } from './facetRules'
import type { FacetRowModel } from './facetRules'
import { useVirtualRows } from './useVirtualRows'

type Props = {
  rows: FacetRowModel[]
  label: string
  height: number
  refreshing: boolean
  showCount?: boolean
  countText?: (count: number | null | undefined) => string
  resultsText?: (count: number) => string
  resetKey: string
  onToggle: (value: string) => void
  onNearEnd?: () => void
  keyboardHint?: string
  regionLabel?: string
}

/** One tab stop; arrow keys traverse the entire logical list, including unmounted rows. */
export function VirtualFacetList({
  rows,
  label,
  height,
  refreshing,
  showCount,
  countText,
  resultsText,
  resetKey,
  onToggle,
  onNearEnd,
  regionLabel,
  keyboardHint = 'Use arrow keys to move through options. Home and End jump to the first and last option. Space selects. Tab leaves the list.',
}: Props) {
  const hintId = useId()
  const [activeValue, setActiveValue] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const [pendingFocus, setPendingFocus] = useState(false)
  const index = rows.findIndex((row) => row.value === activeValue && row.available)
  const activeIndex = index >= 0 ? index : rows.findIndex((row) => row.available)
  const getItemKey = useCallback((i: number) => rows[i].value, [rows])
  const window = useVirtualRows({
    count: rows.length,
    rowHeight: FACET_ROW_HEIGHT,
    height,
    getItemKey,
    resetKey,
    retainedIndex: focused || pendingFocus ? activeIndex : -1,
    onNearEnd,
  })

  useEffect(() => {
    if (focused || pendingFocus || window.items.some((item) => item.index === activeIndex)) return
    const first = rows.findIndex(
      (row, i) => i >= window.visibleStart && i <= window.visibleEnd && row.available,
    )
    if (first >= 0) setActiveValue(rows[first].value)
  }, [
    focused,
    pendingFocus,
    activeIndex,
    rows,
    window.visibleStart,
    window.visibleEnd,
    window.items,
  ])

  useLayoutEffect(() => {
    if (!pendingFocus && !(focused && index < 0)) return
    window.scrollRef.current
      ?.querySelector<HTMLInputElement>(`[data-facet-index="${activeIndex}"] input`)
      ?.focus({ preventScroll: true })
    setPendingFocus(false)
  }, [pendingFocus, focused, index, activeIndex, window.scrollRef])

  return (
    <div
      ref={window.scrollRef}
      role="group"
      aria-label={regionLabel ?? `${label} options`}
      aria-describedby={hintId}
      style={{ height, overflowAnchor: 'none' }}
      className="overflow-y-auto rounded-control border border-line"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      onKeyDown={(event) => {
        if (!(event.target instanceof HTMLInputElement)) return
        const direction = ['ArrowUp', 'End', 'PageUp'].includes(event.key) ? -1 : 1
        let target = activeIndex
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowUp':
            target += direction
            break
          case 'Home':
            target = 0
            break
          case 'End':
            target = rows.length - 1
            break
          case 'PageDown':
          case 'PageUp':
            target += direction * Math.floor(height / FACET_ROW_HEIGHT)
            break
          default:
            return
        }
        event.preventDefault()
        target = Math.max(0, Math.min(rows.length - 1, target))
        while (target >= 0 && target < rows.length && !rows[target].available) target += direction
        if (target < 0 || target >= rows.length) return
        setActiveValue(rows[target].value)
        setPendingFocus(true)
        window.scrollToIndex(target, { align: 'auto' })
      }}
    >
      <p id={hintId} className="sr-only">
        {keyboardHint}
      </p>
      <ul role="list" className="relative m-0 list-none p-0" style={{ height: window.totalSize }}>
        {window.items.map((item) => (
          <FacetRow
            key={item.key}
            row={rows[item.index]}
            refreshing={refreshing}
            showCount={showCount}
            countText={countText}
            resultsText={resultsText}
            onToggle={onToggle}
            height={FACET_ROW_HEIGHT}
            posInSet={item.index + 1}
            setSize={rows.length}
            style={{ position: 'absolute', top: item.start, left: 0, width: '100%' }}
            index={item.index}
            tabIndex={item.index === activeIndex ? 0 : -1}
            onFocus={() => {
              setActiveValue(rows[item.index].value)
              setFocused(true)
            }}
          />
        ))}
      </ul>
    </div>
  )
}
