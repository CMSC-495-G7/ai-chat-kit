import type { CountBadgeProps } from './types'

/**
 * A count in a pill: one digit is a circle, more digits widen it.
 *
 * The corner placement is anchored by its LEFT edge, just past the glyph's
 * centre. The four hand-rolled badges this replaces were anchored by their
 * right edge, so every extra digit grew back over the icon — at "12" the
 * widget rail's badge covered eight of the funnel's fifteen pixels, and at
 * three digits it would have buried it. Anchored on the left, extra digits
 * grow outward, into the rail's spare width, and the glyph stays readable.
 *
 * Nothing shrinks to fit: the type stays 10px and the pill stays 16px tall.
 * Capping at `max` keeps it to three characters — which in the widget's 40px
 * rail still overhangs the rail's edge by a few pixels, because 40 minus a
 * 16px glyph leaves 12 a side and "99+" is 25 wide. That is why the corner
 * badge sits at z-20: the Filters panel slides over the chat column at z-10,
 * so without it the overhang is painted over exactly while that tab is open,
 * and "99+" reads as a flat, wrong "99".
 */
export function CountBadge({
  count,
  max = 99,
  placement = 'inline',
  className = '',
}: CountBadgeProps) {
  if (count <= 0) return null
  const text = count > max ? `${max}+` : String(count)

  const shape =
    placement === 'corner'
      ? 'pointer-events-none absolute -top-1.5 left-1/2 z-20 ml-px h-4 min-w-4 px-1 text-[10px]'
      : 'h-[18px] min-w-[18px] px-1.5 text-[11px]'

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-accent leading-none font-bold whitespace-nowrap text-on-accent tabular-nums ${shape} ${className}`}
    >
      {text}
    </span>
  )
}
