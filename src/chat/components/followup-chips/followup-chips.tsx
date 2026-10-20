import { useState } from 'react'
import { useUiSize } from '../../../lib/uiSize'
import type { FollowupChipsProps } from './types'

/**
 * Suggested next prompts, drawn as branches off the answer above them: a
 * hairline spine drops through the assistant's orb gutter and a node marks each
 * chip, terminating at the last one. The shape is what distinguishes these from
 * the hero's capability chips — these belong to *this* answer.
 *
 * The node is the same dot FeatureTogglesModal draws on its spine (7px ring,
 * panel-solid fill) — that component's comment says it borrowed this file's
 * branch language, so this is the idiom coming home rather than a new one.
 * At rest it's a hollow ring; hovering fills it, which reads as lighting up in
 * a way a colour swap alone does not.
 *
 * Geometry: the negative margin pulls the spine back to the orb's centre
 * (orb width + row gap, halved), and the matching left padding lands each chip
 * flush with the answer text above it — so `pl-7` / `pl-[22px]` must not move.
 * The node centres on the spine at the chip's half-height, so a chip whose text
 * wraps keeps its branch on the first line.
 *
 * Every class is written out in full because Tailwind only sees literal class
 * names in the source — none of these can be built by interpolation.
 */
const SIZING = {
  default: {
    // orb size-7 (28px) + gap-3.5 (14px) → spine sits 28px left of the text column
    list: 'mt-3.5 -ml-7 before:-top-2.5 before:h-2.5',
    row: 'pb-1.5 pl-7',
    spine: 'before:h-full last:before:h-[17px]',
    // 17px half-height − 3.5px half-node; −3px centres a 7px dot on the 1px spine
    node: 'after:top-[13.5px] after:-left-[3px] after:size-[7px]',
    chip: 'px-3.5 py-1.5 text-[13px] rounded-control',
    moreWrap: 'mt-1.5 -ml-7 pl-7',
    more: 'px-3 py-1 text-xs',
  },
  compact: {
    // orb size-6 (24px) + gap-2.5 (10px) → 22px
    list: 'mt-2.5 -ml-[22px] before:-top-2 before:h-2',
    row: 'pb-1 pl-[22px]',
    spine: 'before:h-full last:before:h-[13px]',
    node: 'after:top-[10px] after:-left-[2.5px] after:size-[6px]',
    chip: 'px-3 py-1 text-xs rounded-control',
    moreWrap: 'mt-1 -ml-[22px] pl-[22px]',
    more: 'px-2.5 py-0.5 text-[11px]',
  },
} as const

// Past this many the branch reads as a menu, so the rest collapse behind a toggle.
const VISIBLE_LIMIT = { default: 3, compact: 2 }

export function FollowupChips({ items, onPick, disabled }: FollowupChipsProps) {
  const size = useUiSize()
  const s = SIZING[size]
  const [showAll, setShowAll] = useState(false)

  const overflow = items.length - VISIBLE_LIMIT[size]
  const visible = showAll || overflow < 1 ? items : items.slice(0, VISIBLE_LIMIT[size])

  return (
    <>
      {/* The list's own ::before is the lead-in stub that carries the spine up
          out of the gap, so the branch reads as leaving the answer. */}
      <ul
        aria-label="Suggested follow-ups"
        className={`relative flex flex-col items-start ${s.list}
          before:absolute before:left-0 before:w-px before:bg-ink-soft/25 before:content-['']`}
      >
        {visible.map((text, i) => (
          <li
            key={text}
            style={{ animationDelay: `${i * 60}ms` }}
            className={`relative animate-fade-up last:pb-0 ${s.row} ${s.spine} ${s.node}
              before:absolute before:top-0 before:left-0 before:w-px before:bg-ink-soft/25 before:content-['']
              after:absolute after:rounded-full after:border after:border-ink-soft/30 after:bg-panel-solid after:transition-colors after:content-['']
              hover:after:border-brand-fg hover:after:bg-brand-fg
              focus-within:after:border-brand-fg focus-within:after:bg-brand-fg`}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(text)}
              className={`w-fit max-w-full border border-line text-left font-medium text-ink transition hover:translate-x-0.5 hover:border-brand-fg/50 hover:text-ink-strong disabled:pointer-events-none disabled:opacity-50 ${s.chip}`}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>

      {overflow >= 1 && (
        <div className={s.moreWrap}>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className={`rounded-control border border-dashed border-line font-medium text-ink-soft transition hover:border-brand-fg/40 hover:text-ink-strong ${s.more}`}
          >
            {showAll ? 'Show fewer' : `+${overflow} more`}
          </button>
        </div>
      )}
    </>
  )
}
