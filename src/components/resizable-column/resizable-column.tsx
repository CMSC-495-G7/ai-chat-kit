import { useRef } from 'react'
import { ResizeHandle } from '../../primitives/resize-handle'
import { useResizablePanel } from '../../hooks/useResizablePanel'
import type { ResizableColumnProps } from './types'

/**
 * A right-hand column with a drag handle on its left edge, for splitting a
 * card into chat + document panes. Clamps against its parent's rect so the
 * sibling column always keeps `minRemainder` px. Shared by the demo's
 * reference pane and the widget's split view.
 */
export function ResizableColumn({
  initial,
  storageKey,
  minWidth = 280,
  minRemainder = 280,
  'aria-label': ariaLabel = 'Resize panel',
  className = '',
  children,
}: ResizableColumnProps) {
  const { width, dragging, startResize } = useResizablePanel({ initial, storageKey })
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} style={{ width }} className={`relative shrink-0 ${className}`}>
      <ResizeHandle
        active={dragging}
        aria-label={ariaLabel}
        onPointerDown={(e) =>
          startResize(e, (clientX) => {
            const parent = ref.current?.parentElement?.getBoundingClientRect()
            if (!parent) return width
            return Math.max(minWidth, Math.min(parent.width - minRemainder, parent.right - clientX))
          })
        }
      />
      {children}
    </div>
  )
}
