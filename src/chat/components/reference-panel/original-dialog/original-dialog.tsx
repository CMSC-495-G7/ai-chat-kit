import type { ReactNode } from 'react'
import { Modal } from '../../../../primitives/modal'
import type { Source } from '../../../engine/types'
import type { ReferenceOriginalProps } from '../types'
import { useOriginalView } from '../useOriginalView'
import { ZoomControls } from '../zoom-controls'

type OriginalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: Source
  /** The line under the title — "PDF · 12 pages · Updated Mar 2026". */
  meta?: string
  renderOriginal: (props: ReferenceOriginalProps) => ReactNode
}

/**
 * A source's original in a dialog, for reading it at more than a side panel's
 * width. The dialog's own expand button takes it to most of the window.
 */
export function OriginalDialog({
  open,
  onOpenChange,
  source,
  meta,
  renderOriginal,
}: OriginalDialogProps) {
  return (
    // Keys pressed in the dialog are the dialog's. Left alone they would
    // bubble on to the panel — where the arrows change reference and Escape
    // closes the panel — and to a slide-over that holds it. The dialog closes
    // itself on Escape through the browser's own `cancel`, which this leaves be.
    <div onKeyDown={(event) => event.stopPropagation()}>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={source.title}
        description={meta || undefined}
        size="lg"
        expandable
        closeLabel="Close original"
        expandLabel="Expand original"
        restoreLabel="Restore original size"
        // A document scrolls itself, so it needs a height to scroll within:
        // the dialog is given one, and expanding it changes the width alone.
        contentClassName="h-[80dvh]"
      >
        {/* Mounted only while open: a closed dialog holds no file, and each
            opening starts at 100%. */}
        {open && <Opened source={source} renderOriginal={renderOriginal} />}
      </Modal>
    </div>
  )
}

function Opened({
  source,
  renderOriginal,
}: Pick<OriginalDialogProps, 'source' | 'renderOriginal'>) {
  const view = useOriginalView(source, renderOriginal)
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex justify-end">
        <ZoomControls view={view} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-control border border-line">
        {view.node}
      </div>
    </div>
  )
}
