import { useEffect, useId, useState } from 'react'
import { useHoverCard } from '../../hooks/useHoverCard'
import { HoverCard } from '../hover-card'
import { Pill } from '../pill'
import type { PillListProps } from './types'

const DEFAULT_MAX = 3

/** `+12` while it fits, `99+` once it would not. */
const countText = (hidden: number, cap: number) => (hidden > cap ? `${cap}+` : `+${hidden}`)

/** The hidden pills' text, for a screen reader — only when every label is plain text. */
function describe(labels: React.ReactNode[]) {
  return labels.every((l) => typeof l === 'string' || typeof l === 'number')
    ? labels.join(', ')
    : undefined
}

/**
 * A row of pills that shows some of them and folds the rest into a count.
 *
 * The count is a button. Hover the list, focus the count, or tap it, and the
 * hidden pills open in a `HoverCard` — portalled, so a table cell's
 * `overflow-hidden` cannot clip it. Hover and focus are `useHoverCard`'s, which
 * keeps the card open while the pointer is on it and closes on Escape. A tap
 * pins it open until the next tap elsewhere, because touch has no hover.
 *
 * The list stays on one line. Pills give up width before the count does, down
 * to a floor of three rem each, so a long tag truncates with an ellipsis rather
 * than pushing the count out of its cell — and a short one is never squeezed to
 * a single letter.
 *
 * `max` is the caller's, from `0`: a dense column can show only the count, a
 * detail panel can show them all. Nothing here decides it from the width,
 * because a count that changes as the window resizes is a count nobody can
 * compare across rows.
 */
export function PillList({
  items,
  max = DEFAULT_MAX,
  tone,
  variant = 'soft',
  size = 'sm',
  overflowCap = 99,
  label,
  overflowLabel = (n) => `${n} more`,
  empty = null,
  cardMaxWidth = 300,
  className = '',
}: PillListProps) {
  const limit = Number.isNaN(max) ? DEFAULT_MAX : Math.max(0, Math.floor(max))
  const shown = items.slice(0, limit)
  const hidden = items.slice(limit)

  const [anchor, setAnchor] = useState<HTMLUListElement | null>(null)
  const hover = useHoverCard(hidden.length > 0)
  const [pinned, setPinned] = useState(false)
  const descId = useId()

  // A tap pins the card. It lets go on a press anywhere else, or Escape. The
  // card is portalled out of the list, so "elsewhere" has to know about it.
  useEffect(() => {
    if (!pinned) return
    const onDown = (e: PointerEvent) => {
      const target = e.target
      if (!(target instanceof Element)) return
      if (anchor?.contains(target) || target.closest('[data-pill-list-card]')) return
      setPinned(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setPinned(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [pinned, anchor])

  if (items.length === 0) return <>{empty}</>

  const open = hidden.length > 0 && (hover.open || pinned)
  // The count is not a tag, so it is drawn the other way round: outlined beside
  // soft tags, soft beside outlined ones.
  const countVariant = variant === 'outline' ? 'soft' : 'outline'
  const pillProps = (item: (typeof items)[number]) => ({
    tone: item.tone ?? tone,
    variant,
    size,
    leadingIcon: item.leadingIcon,
  })

  return (
    <>
      <ul
        ref={setAnchor}
        aria-label={label}
        onPointerEnter={hover.anchorProps.onPointerEnter}
        onPointerLeave={hover.anchorProps.onPointerLeave}
        onPointerDown={hover.anchorProps.onPointerDown}
        className={`m-0 inline-flex max-w-full min-w-0 list-none flex-nowrap items-center gap-1.5 p-0 ${className}`}
      >
        {shown.map((item) => (
          <li key={item.id} className="flex min-w-12 shrink">
            <Pill {...pillProps(item)}>{item.label}</Pill>
          </li>
        ))}

        {hidden.length > 0 && (
          <li className="flex shrink-0">
            <Pill
              tone="neutral"
              variant={countVariant}
              size={size}
              aria-label={overflowLabel(hidden.length)}
              aria-expanded={open}
              aria-describedby={describe(hidden.map((h) => h.label)) ? descId : undefined}
              onFocus={hover.anchorProps.onFocus}
              onBlur={hover.anchorProps.onBlur}
              onClick={() => setPinned((v) => !v)}
              className="tabular-nums"
            >
              {countText(hidden.length, overflowCap)}
            </Pill>
            <span id={descId} className="sr-only">
              {describe(hidden.map((h) => h.label))}
            </span>
          </li>
        )}
      </ul>

      {hidden.length > 0 && (
        <HoverCard
          anchor={anchor}
          open={open}
          maxWidth={cardMaxWidth}
          onPointerEnter={hover.cardProps.onPointerEnter}
          onPointerLeave={hover.cardProps.onPointerLeave}
        >
          <div
            data-pill-list-card=""
            style={{ maxHeight: 'var(--hover-card-max-h)' }}
            className="mx-auto flex w-fit max-w-full flex-wrap gap-1.5 overflow-y-auto rounded-surface border border-line bg-panel-solid p-2.5 shadow-lg shadow-(color:--shadow-menu)"
          >
            {hidden.map((item) => (
              <Pill key={item.id} {...pillProps(item)}>
                {item.label}
              </Pill>
            ))}
          </div>
        </HoverCard>
      )}
    </>
  )
}
