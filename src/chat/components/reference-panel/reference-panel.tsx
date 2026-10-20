import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  PopOutIcon,
  XIcon,
} from '../../../primitives/icons'
import { IconButton } from '../../../primitives/icon-button'
import { Tabs, TabsList, TabsTrigger } from '../../../primitives/tabs'
import { useUiSize } from '../../../lib/uiSize'
import { useWheelToHorizontal } from '../../../hooks/useWheelToHorizontal'
import { Markdown } from '../markdown'
import { OriginalDialog } from './original-dialog'
import type { ReferencePanelProps } from './types'
import { useOriginalView } from './useOriginalView'
import { ZoomControls } from './zoom-controls'

// Above this many sources, the pill rail alone is a long horizontal scroll, so
// the row also gets a jump-to-number box for landing on a distant reference in
// one gesture.
const JUMP_THRESHOLD = 12

// The rail fades out at its own right edge rather than stopping abruptly, so
// "there's more, scroll" reads as a property of the row instead of a guess —
// same idea at 3 sources or 50, no extra affordance to add as the count grows.
const RAIL_FADE = {
  maskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent 100%)',
} as const

type View = 'excerpt' | 'original'

/**
 * The markdown frame: renders one reference document with fast navigation
 * between all of a message's sources — prev/next, a numbered pill rail,
 * and arrow-key support, so jumping from reference 2 to 21 is one gesture.
 *
 * With `renderOriginal`, a source that has a file to show also gets an
 * Excerpt / Original switch: the excerpt is where the cited passage is
 * highlighted, the original is the file it came from. With `popOut` as well,
 * a button beside the switch opens the original in a dialog.
 */
export function ReferencePanel({
  sources,
  activeId,
  onSelect,
  onClose,
  highlights,
  backLabel,
  renderOriginal,
  popOut = false,
}: ReferencePanelProps) {
  const compact = useUiSize() === 'compact'
  const rootRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // A wheel mouse has no sideways gesture, so the pill rail would be
  // unreachable with one past the first few references.
  useWheelToHorizontal(railRef)

  const at = sources.findIndex((s) => s.id === activeId)
  const active = sources[at] ?? sources[0]
  const prev = at > 0 ? sources[at - 1] : undefined
  const next = at >= 0 && at < sources.length - 1 ? sources[at + 1] : undefined
  const showJump = sources.length > JUMP_THRESHOLD

  // Draft for the jump box; mirrors the active reference until the user edits.
  const [jumpDraft, setJumpDraft] = useState(String(active.id))
  useEffect(() => {
    setJumpDraft(String(active.id))
  }, [active.id])

  // Commit a jump by the [n] marker number; revert the draft if it's unknown.
  const commitJump = () => {
    const target = sources.find((s) => s.id === Number(jumpDraft))
    if (target) onSelect(target.id)
    else setJumpDraft(String(active.id))
  }

  // The view is the reader's choice and outlives a change of reference: on a
  // source with no original it simply has nothing to apply to, and comes back
  // on the next one that has.
  const [view, setView] = useState<View>('excerpt')
  const original = useOriginalView(active, renderOriginal)
  const hasOriginal = original.node !== null
  const showOriginal = view === 'original' && hasOriginal
  // The dialog is modal, so the reference can't change under it while open.
  const [poppedOut, setPoppedOut] = useState(false)

  // Take focus when the frame opens so arrow keys work immediately.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  // "PDF · 12 pages · Updated Mar 2026" — only the parts a source actually has.
  const meta = [
    active.fileType,
    active.pageCount != null ? `${active.pageCount} pages` : undefined,
    active.updatedLabel ? `Updated ${active.updatedLabel}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')

  // Keep the active pill visible and, on change, jump to the first highlighted
  // passage if there is one (else restart reading from the top). Coming back
  // from the original counts as a change: the excerpt is mounted afresh.
  useEffect(() => {
    railRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
    const mark = bodyRef.current?.querySelector('[data-hl]')
    if (mark) mark.scrollIntoView({ block: 'center', behavior: 'smooth' })
    else bodyRef.current?.scrollTo({ top: 0 })
  }, [activeId, showOriginal])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as Element).closest('[role="tablist"]')) return
    if (e.key === 'ArrowLeft' && prev) onSelect(prev.id)
    else if (e.key === 'ArrowRight' && next) onSelect(next.id)
    else if (e.key === 'Escape') onClose()
    else return
    e.preventDefault()
  }

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-label={`Reference ${active.id}: ${active.title}`}
      className="flex min-h-0 flex-1 flex-col outline-none"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-3 py-2.5">
        {backLabel && (
          <IconButton onClick={onClose} aria-label={backLabel} title={backLabel}>
            <ChevronLeftIcon width={16} height={16} />
          </IconButton>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 font-semibold text-ink-strong">
            <span
              aria-hidden
              className="grid size-[18px] shrink-0 place-items-center rounded-control bg-brand-solid text-[10px] font-bold text-on-brand-solid"
            >
              {active.id}
            </span>
            <span className={`min-w-0 flex-1 truncate ${compact ? 'text-[13px]' : 'text-sm'}`}>
              {active.title}
            </span>
          </p>
          {meta && <p className="mt-0.5 truncate pl-[25px] text-[11px] text-ink-soft">{meta}</p>}
        </div>
        {active.url && (
          <a
            href={active.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open original document: ${active.title}`}
            title="Open original ↗"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-brand-fg/25 bg-brand-fg/7 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-brand-fg transition hover:bg-brand-fg/12"
          >
            <ExternalLinkIcon width={12} height={12} />
            Open
          </a>
        )}
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            onClick={() => prev && onSelect(prev.id)}
            disabled={!prev}
            aria-label="Previous reference"
            title="Previous reference"
          >
            <ChevronLeftIcon width={16} height={16} />
          </IconButton>
          <IconButton
            onClick={() => next && onSelect(next.id)}
            disabled={!next}
            aria-label="Next reference"
            title="Next reference"
          >
            <ChevronRightIcon width={16} height={16} />
          </IconButton>
          {!backLabel && (
            <IconButton onClick={onClose} aria-label="Close references" title="Close">
              <XIcon width={16} height={16} />
            </IconButton>
          )}
        </div>
      </div>

      {sources.length > 1 && (
        <div className="flex items-center gap-4 border-b border-line px-3 py-2">
          <Tabs
            value={String(active.id)}
            onValueChange={(value) => value != null && onSelect(Number(value))}
            className="min-w-0 flex-1"
          >
            <TabsList
              ref={railRef}
              variant="unstyled"
              style={RAIL_FADE}
              aria-label="References"
              className="flex min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
            >
              {sources.map((source) => {
                const isActive = source.id === active.id
                return (
                  <TabsTrigger
                    key={source.id}
                    value={String(source.id)}
                    controls={false}
                    data-active={isActive || undefined}
                    title={source.title}
                    className={`grid size-7 place-items-center rounded-control text-xs font-semibold transition ${
                      isActive
                        ? 'bg-brand-solid text-on-brand-solid'
                        : 'border border-line text-ink-soft hover:bg-tint/8 hover:text-ink-strong'
                    }`}
                  >
                    {source.id}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
          {showJump && (
            <>
              <span aria-hidden className="h-[18px] w-px shrink-0 bg-line" />
              <div className="flex shrink-0 items-center gap-1 rounded-control border border-line px-1.5 py-1 text-xs text-ink-soft">
                <input
                  aria-label="Jump to reference number"
                  title="Jump to reference"
                  inputMode="numeric"
                  value={jumpDraft}
                  onChange={(e) => setJumpDraft(e.target.value.replace(/\D/g, ''))}
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={commitJump}
                  onKeyDown={(e) => {
                    // Keep typing (incl. arrows) from reaching the panel's nav keys.
                    e.stopPropagation()
                    if (e.key === 'Enter') commitJump()
                    else if (e.key === 'Escape') setJumpDraft(String(active.id))
                  }}
                  className="w-7 bg-transparent text-center font-semibold text-ink-strong tabular-nums outline-none"
                />
                <span className="tabular-nums">/ {sources.length}</span>
              </div>
            </>
          )}
        </div>
      )}

      {hasOriginal && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2">
          <Tabs
            value={showOriginal ? 'original' : 'excerpt'}
            onValueChange={(value) => value != null && setView(value as View)}
          >
            <TabsList variant="segmented" aria-label="View">
              <TabsTrigger value="excerpt" controls={false}>
                Excerpt
              </TabsTrigger>
              <TabsTrigger value="original" controls={false}>
                Original
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {popOut && (
            <IconButton
              size="sm"
              shape="rounded"
              onClick={() => setPoppedOut(true)}
              aria-haspopup="dialog"
              aria-label="Open original in a pop-up"
              title="Open original in a pop-up"
            >
              <PopOutIcon width={16} height={16} />
            </IconButton>
          )}
          {showOriginal && (
            <div className="ml-auto">
              <ZoomControls view={original} />
            </div>
          )}
        </div>
      )}

      {showOriginal ? (
        <div
          className="flex min-h-0 flex-1 flex-col"
          // Inside the document, left and right scroll a zoomed page; they
          // mustn't also flip to the neighbouring reference. Escape still closes.
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopPropagation()
          }}
        >
          {original.node}
        </div>
      ) : (
        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 overflow-y-auto text-ink ${
            compact ? 'px-4 py-3.5 text-sm leading-[1.65]' : 'px-5 py-4 text-[15px] leading-[1.75]'
          }`}
        >
          <Markdown text={active.markdown} highlights={highlights} activeRef={active.id} />
        </div>
      )}
      {popOut && renderOriginal && hasOriginal && (
        <OriginalDialog
          open={poppedOut}
          onOpenChange={setPoppedOut}
          source={active}
          meta={meta}
          renderOriginal={renderOriginal}
        />
      )}
    </div>
  )
}
