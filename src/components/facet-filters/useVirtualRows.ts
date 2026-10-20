import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

type UseVirtualRowsOptions = {
  count: number
  rowHeight: number
  height: number
  overscan?: number
  resetKey?: unknown
  onNearEnd?: () => void
  getItemKey?: (index: number) => string | number
  /** Keep a focused row mounted even when the viewer scrolls away. */
  retainedIndex?: number
  enabled?: boolean
}

/** Fixed-height TanStack adapter. Loading and selection still belong to the host. */
export function useVirtualRows({
  count,
  rowHeight,
  height,
  overscan = 4,
  resetKey,
  onNearEnd,
  getItemKey,
  retainedIndex = -1,
  enabled = true,
}: UseVirtualRowsOptions) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const notifiedCount = useRef(-1)
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    getItemKey,
    overscan,
    enabled,
    rangeExtractor: useCallback(
      (range) => {
        const indexes = defaultRangeExtractor(range)
        if (retainedIndex >= 0 && retainedIndex < count && !indexes.includes(retainedIndex)) {
          indexes.push(retainedIndex)
          indexes.sort((a, b) => a - b)
        }
        return indexes
      },
      [retainedIndex, count],
    ),
  })

  useLayoutEffect(() => {
    notifiedCount.current = -1
    virtualizer.scrollToOffset(0)
  }, [resetKey, virtualizer])

  const items = virtualizer.getVirtualItems()
  const lastVisible = virtualizer.range?.endIndex ?? -1
  useEffect(() => {
    if (
      onNearEnd &&
      enabled &&
      count > 0 &&
      lastVisible >= count - overscan - 1 &&
      notifiedCount.current !== count
    ) {
      notifiedCount.current = count
      onNearEnd?.()
    }
  }, [enabled, count, lastVisible, overscan, onNearEnd, resetKey])

  // Retained for consumers of the original contiguous-window adapter.
  const start = items[0]?.index ?? 0
  const end = (items.at(-1)?.index ?? -1) + 1
  return {
    scrollRef,
    items,
    totalSize: virtualizer.getTotalSize(),
    visibleStart: virtualizer.range?.startIndex ?? 0,
    visibleEnd: virtualizer.range?.endIndex ?? 0,
    scrollToIndex: virtualizer.scrollToIndex,
    start,
    end,
    padTop: start * rowHeight,
    padBottom: Math.max(0, (count - end) * rowHeight),
    onScroll: () => {},
    height,
  }
}
