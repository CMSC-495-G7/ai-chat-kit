import type { ResizeHandleProps } from './types'

/**
 * A thin vertical grip pinned to a panel's left edge for drag-to-resize.
 * Presentational only — width state and the drag lifecycle live in
 * `useResizablePanel`.
 */
export function ResizeHandle({
  onPointerDown,
  active,
  className = '',
  'aria-label': ariaLabel = 'Resize panel',
}: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      className={`group absolute inset-y-0 left-0 z-50 w-1.5 cursor-col-resize touch-none ${className}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-0.5 transition-colors group-hover:bg-accent/60 ${
          active ? 'bg-accent/70' : 'bg-transparent'
        }`}
      />
    </div>
  )
}
