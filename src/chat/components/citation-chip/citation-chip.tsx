import { useId, useState } from 'react'
import { previewDescription } from '../../engine/highlights'
import { useHoverCard } from '../../../hooks/useHoverCard'
import { useUiSize } from '../../../lib/uiSize'
import { HoverCard } from '../../../primitives/hover-card'
import { CitationPreviewCard } from './citation-preview'
import type { CitationChipProps } from './types'

/**
 * An inline [n] citation marker rendered as a small clickable chip.
 * Superscript effect comes from a translate rather than <sup> so the
 * surrounding line-height stays stable.
 *
 * With a `preview` lookup it also grows a hover/focus card showing the passage
 * it cites. The native `title` goes when that happens: it duplicated the
 * aria-label, and an OS tooltip would draw a second box on top of the card.
 */
export function CitationChip({ n, onClick, preview }: CitationChipProps) {
  const compact = useUiSize() === 'compact'
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const hover = useHoverCard(!!preview)
  const descId = useId()

  // Resolved only once the card is opening — see CitationPreviewLookup.
  const data = hover.open && preview ? preview(n) : null

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        onClick={onClick}
        aria-label={`Open reference ${n}`}
        title={preview ? undefined : `Reference ${n}`}
        // An IDREF can't cross a shadow boundary, so the description lives
        // inside the chip's own tree rather than in the portalled card. The
        // explicit aria-label means it can't leak into the accessible name.
        aria-describedby={data ? descId : undefined}
        {...hover.anchorProps}
        className="mx-0.5 inline-flex min-w-4 -translate-y-[0.35em] items-center justify-center rounded-control bg-chip px-1 text-[10px] leading-4 font-semibold text-chip-fg transition hover:bg-chip-hover"
      >
        {n}
        {data && (
          <span id={descId} className="sr-only">
            {previewDescription(data)}
          </span>
        )}
      </button>

      {data && (
        <HoverCard
          anchor={anchor}
          open
          maxWidth={compact ? 300 : 360}
          maxHeight={compact ? 240 : 320}
          onPointerEnter={hover.cardProps.onPointerEnter}
          onPointerLeave={hover.cardProps.onPointerLeave}
        >
          <CitationPreviewCard preview={data} onOpenReference={onClick} />
        </HoverCard>
      )}
    </>
  )
}
