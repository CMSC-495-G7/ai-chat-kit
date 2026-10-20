import { useId } from 'react'
import { ArrowRightIcon, SparkleIcon } from '../../../../primitives/icons'
import type { SuggestedQuestionsProps } from '../types'

/**
 * Today's suggested questions laid out in the open on an empty conversation.
 * There the sparkle menu and suggest-as-you-type are hidden — this is the same
 * list, shown before anyone has to ask for it. Picking one asks it.
 */
export function SuggestedQuestions({
  suggestions,
  onPick,
  limit = 4,
  compact,
  layout = 'grid',
}: SuggestedQuestionsProps) {
  const headingId = useId()
  const shown = suggestions.slice(0, limit)
  if (shown.length === 0) return null
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold tracking-wider text-ink-soft uppercase"
      >
        <SparkleIcon width={13} height={13} className="text-brand-fg" />
        Suggested for today
      </h2>
      {layout === 'list' ? (
        <ul className="border-b border-line">
          {shown.map((s) => (
            <li key={s.text} className="flex border-t border-line">
              <button
                type="button"
                onClick={() => onPick(s.text)}
                className={`group flex w-full items-center gap-4 text-left transition-colors hover:bg-tint/8 ${
                  compact ? 'px-1.5 py-2.5' : 'px-2 py-3'
                }`}
              >
                <span
                  className={`flex-1 text-ink-strong ${compact ? 'text-[14px] leading-snug' : 'text-[15px]'}`}
                >
                  {s.text}
                </span>
                {/* Below sm a reason would squeeze the question into three
                    lines; the question is the part worth the width. */}
                {s.reason && !compact && (
                  <span className="hidden shrink-0 text-[13px] text-ink-soft sm:inline">
                    {s.reason}
                  </span>
                )}
                <ArrowRightIcon
                  width={compact ? 14 : 16}
                  height={compact ? 14 : 16}
                  className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-2'}`}>
          {shown.map((s) => (
            <li key={s.text} className="flex">
              <button
                type="button"
                onClick={() => onPick(s.text)}
                className="glass flex w-full flex-col items-start gap-0.5 rounded-control px-3.5 py-2.5 text-left transition hover:border-accent/50"
              >
                <span
                  className={`font-semibold text-ink-strong ${compact ? 'text-[12.5px]' : 'text-[13px]'}`}
                >
                  {s.text}
                </span>
                {s.reason && <span className="text-[11px] text-ink-soft">{s.reason}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
