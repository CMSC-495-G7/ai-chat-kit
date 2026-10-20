import type { PointerEvent } from 'react'

export type ResizeHandleProps = {
  onPointerDown: (e: PointerEvent) => void
  /** Reflects the drag state so the grip can stay highlighted while dragging. */
  active?: boolean
  className?: string
  'aria-label'?: string
}
