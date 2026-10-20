import { SparkleIcon } from '../../../../primitives/icons'
import { Kbd } from '../../../../primitives/kbd'
import type { SuggestionListProps } from '../types'

/** Split `text` around the first case-insensitive occurrence of `query`. */
function highlight(text: string, query: string) {
  const q = query.trim()
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-extrabold text-ink-strong">{text.slice(at, at + q.length)}</strong>
      {text.slice(at + q.length)}
    </>
  )
}

/**
 * The floating list above the composer while suggest-as-you-type is on.
 *
 * Rows pick on mousedown, not click: focus is in the draft, and a click would
 * blur it first — which hides this list before the click could land.
 */
export function SuggestionList({
  id,
  label,
  items,
  query,
  active,
  onPick,
  compact,
  placement = 'up',
}: SuggestionListProps) {
  return (
    <div
      className={`absolute inset-x-0 z-20 rounded-control ${placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} border border-line bg-panel-solid p-1.5 shadow-xl shadow-(color:--shadow-menu)`}
    >
      <p
        id={`${id}-label`}
        className="px-2.5 pt-1 pb-1 text-[10.5px] font-bold tracking-wider text-ink-soft uppercase"
      >
        {label}
      </p>
      <ul id={id} role="listbox" aria-labelledby={`${id}-label`} className="flex flex-col gap-px">
        {items.map((s, i) => (
          <li
            key={s.text}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => {
              e.preventDefault()
              onPick(s.text)
            }}
            className={`flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 transition ${
              i === active ? 'bg-tint/10' : 'hover:bg-tint/6'
            }`}
          >
            <SparkleIcon
              width={13}
              height={13}
              className={`shrink-0 ${i === active ? 'text-accent' : 'text-ink-soft'}`}
            />
            <span
              className={`min-w-0 flex-1 truncate text-ink ${compact ? 'text-[12.5px]' : 'text-[13px]'}`}
            >
              {highlight(s.text, query)}
            </span>
            {s.reason && !compact && (
              <span className="shrink-0 text-[11px] text-ink-soft">{s.reason}</span>
            )}
          </li>
        ))}
      </ul>
      {!compact && (
        <p className="flex items-center gap-3 px-2.5 pt-1.5 pb-0.5 text-[11px] text-ink-soft">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
          </span>
          <span>
            <Kbd>Tab</Kbd> accept
          </span>
          <span>
            <Kbd>Esc</Kbd> hide
          </span>
        </p>
      )}
    </div>
  )
}
