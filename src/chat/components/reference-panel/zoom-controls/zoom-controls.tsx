import { IconButton } from '../../../../primitives/icon-button'
import { MinusIcon, PlusIcon } from '../../../../primitives/icons'
import type { OriginalView } from '../useOriginalView'

/** The page count, when the file has one, and the zoom stepper for an original. */
export function ZoomControls({ view }: { view: OriginalView }) {
  return (
    <div className="flex items-center gap-3">
      {view.pageLabel && (
        <span className="text-xs whitespace-nowrap text-ink-soft tabular-nums">
          {view.pageLabel}
        </span>
      )}
      <div className="flex items-center rounded-control border border-line">
        <IconButton
          size="sm"
          shape="rounded"
          onClick={view.zoomOut}
          disabled={!view.canZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <MinusIcon width={14} height={14} />
        </IconButton>
        <span
          className={`min-w-10 text-center text-xs font-semibold text-ink-strong tabular-nums ${
            view.ready ? '' : 'opacity-40'
          }`}
        >
          {Math.round(view.zoom * 100)}%
        </span>
        <IconButton
          size="sm"
          shape="rounded"
          onClick={view.zoomIn}
          disabled={!view.canZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <PlusIcon width={14} height={14} />
        </IconButton>
      </div>
    </div>
  )
}
