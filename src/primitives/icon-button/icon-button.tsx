import type { IconButtonProps } from './types'

/**
 * Fixed boxes, not padding. The size a finger has to hit must not depend on
 * what `width`/`height` a caller happened to pass its icon — that is how this
 * component ended up rendering 22px targets. The glyph is centred in the box
 * and can stay as small as the design wants.
 *
 *   sm  32  clears WCAG 2.2 SC 2.5.8 (24 minimum)
 *   md  36  the default for message and panel actions
 *   lg  44  Apple HIG minimum — use for touch-only controls
 */
const sizeBox: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-11',
}

const ghost =
  'text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong disabled:pointer-events-none disabled:opacity-40'

/**
 * Icon-only ghost button — the recurring control in the chat UI (header actions,
 * reference nav, message actions, panel close). Consolidates a Tailwind class
 * string that was previously copy-pasted across half a dozen components.
 *
 * Every variant has a guaranteed minimum target (see `sizeBox`), so prefer this
 * over a hand-rolled `p-*` button even for a tiny glyph: an inline 12px close
 * icon still gets a 32px box.
 *
 * `active` applies the accent tint used by toggle controls (e.g. the like/dislike
 * buttons). Disabled styling is always present but only shows when `disabled` is
 * set, so nav buttons at the ends of a list dim correctly.
 */
export function IconButton({
  size = 'md',
  shape = 'circle',
  active = false,
  type = 'button',
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  const cls = [
    'inline-grid shrink-0 place-items-center',
    shape === 'circle' ? 'rounded-full' : 'rounded-control',
    sizeBox[size],
    ghost,
    active ? 'text-accent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
