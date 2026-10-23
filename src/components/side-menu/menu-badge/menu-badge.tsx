export type MenuBadgeProps = {
  count: number
  /** Hangs off the corner of a rail icon instead of sitting in a row. */
  corner?: boolean
}

/**
 * A count that needs someone. The warm `notify` fill rather than CountBadge's
 * accent: in a menu that is otherwise neutral, this is the one mark meant to
 * pull the eye.
 */
export function MenuBadge({ count, corner = false }: MenuBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-notify leading-none font-bold text-on-notify tabular-nums ${
        corner
          ? 'pointer-events-none absolute -top-1 left-1/2 ml-0.5 h-4 min-w-4 px-1 text-[10px]'
          : 'h-5 min-w-5 px-1.5 text-[11px]'
      }`}
    >
      {count}
    </span>
  )
}
