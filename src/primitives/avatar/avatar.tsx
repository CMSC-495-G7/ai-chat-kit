import type { AvatarProps, AvatarSize, AvatarTone } from './types'

const sizes: Record<Exclude<AvatarSize, number>, string> = {
  xs: 'size-5 text-[9px]',
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-[13px]',
  lg: 'size-16 text-[25px]',
}

const tones: Record<AvatarTone, string> = {
  neutral: 'bg-ink-soft text-panel-solid',
  soft: 'bg-chip text-chip-fg',
  brand: 'bg-brand-solid text-on-brand-solid',
  accent: 'bg-accent text-on-accent',
}

/**
 * A person-sized identity mark. Content is explicit — image, short text, or
 * icon — so fallbacks do not depend on an image error firing at the right time.
 *
 * `onClick` changes the root from a presentational span to a native button.
 * The shape and content stay the same; only the interaction semantics change.
 */
export function Avatar(props: AvatarProps) {
  const {
    shape = 'circle',
    size = 'md',
    tone = 'neutral',
    onClick,
    className = '',
    style,
    ...rest
  } = props
  const numericSize = typeof size === 'number' ? Math.max(onClick ? 24 : 16, size) : undefined
  const sizeClass =
    typeof size === 'number' ? '' : onClick && size === 'xs' ? 'size-6 text-[9px]' : sizes[size]
  const rootStyle = numericSize
    ? {
        width: numericSize,
        height: numericSize,
        fontSize: Math.max(8, Math.round(numericSize * 0.36)),
        ...style,
      }
    : style
  const cls = [
    'inline-grid shrink-0 place-items-center overflow-hidden font-extrabold leading-none',
    shape === 'square' ? 'rounded-control' : 'rounded-full',
    sizeClass,
    tones[tone],
    onClick ? 'cursor-pointer transition hover:brightness-95 active:brightness-90' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content =
    props.variant === 'image' ? (
      <img src={props.src} alt={props.alt} className="size-full object-cover" />
    ) : props.variant === 'icon' ? (
      <span
        aria-hidden="true"
        className="inline-grid size-[58%] place-items-center [&>svg]:size-full"
      >
        {props.icon}
      </span>
    ) : (
      props.text
    )

  const label = props.variant === 'icon' ? props.label : undefined

  // Variant-only content props have already been consumed above. Keeping the
  // DOM attributes explicit prevents `src`, `text`, or `icon` leaking onto the
  // root element while still forwarding aria/data attributes from callers.
  const {
    variant: _variant,
    text: _text,
    src: _src,
    alt: _alt,
    icon: _icon,
    label: _label,
    ...domProps
  } = rest as AvatarProps & Record<string, unknown>

  return onClick ? (
    <button
      type="button"
      className={cls}
      style={rootStyle}
      aria-label={label}
      data-avatar=""
      onClick={onClick}
      {...domProps}
    >
      {content}
    </button>
  ) : (
    <span
      className={cls}
      style={rootStyle}
      role={label ? 'img' : undefined}
      aria-label={label}
      data-avatar=""
      {...domProps}
    >
      {content}
    </span>
  )
}
