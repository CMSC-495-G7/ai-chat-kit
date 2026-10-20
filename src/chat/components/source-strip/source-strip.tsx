import { useState } from 'react'
import { ExternalLinkIcon } from '../../../primitives/icons'
import { useUiSize } from '../../../lib/uiSize'
import type { SourceStripProps } from './types'

// Past this many sources, collapse the strip behind a "+N more" toggle so a
// large corpus doesn't swallow the conversation.
const VISIBLE_LIMIT = 8

/**
 * Compact row of numbered source pills under an assistant message. The pill
 * opens the reference here; a source with a `url` also gets a small trailing
 * icon button that skips straight to the original document in a new tab —
 * two distinct targets in one control, not one button doing two things.
 */
export function SourceStrip({ sources, onCite }: SourceStripProps) {
  const compact = useUiSize() === 'compact'
  const [showAll, setShowAll] = useState(false)
  const overflow = sources.length - VISIBLE_LIMIT
  const visible = showAll || overflow < 2 ? sources : sources.slice(0, VISIBLE_LIMIT)

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {visible.map((source) => (
        <div
          key={source.id}
          className="flex items-stretch overflow-hidden rounded-control border border-line"
        >
          <button
            type="button"
            onClick={() => onCite(source.id)}
            title={source.title}
            className={`flex items-center gap-1.5 font-medium text-ink-soft transition hover:bg-tint/6 hover:text-ink-strong ${
              compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-[13px]'
            }`}
          >
            <span className="grid size-4 shrink-0 place-items-center rounded bg-chip text-[10px] font-semibold text-chip-fg">
              {source.id}
            </span>
            <span className="max-w-[18ch] truncate">{source.title}</span>
          </button>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open original document: ${source.title}`}
              title="Open original ↗"
              className="flex shrink-0 items-center border-l border-line px-1.5 text-ink-soft transition hover:bg-tint/8 hover:text-brand-fg"
            >
              <ExternalLinkIcon width={12} height={12} />
            </a>
          )}
        </div>
      ))}
      {overflow >= 2 && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className={`rounded-control border border-dashed border-line font-medium text-ink-soft transition hover:bg-tint/6 hover:text-ink-strong ${
            compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-[13px]'
          }`}
        >
          {showAll ? 'Show fewer' : `+${overflow} more`}
        </button>
      )}
    </div>
  )
}
