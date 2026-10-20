import { XIcon } from '../icons'
import type { PillProps, PillTone, PillVariant } from './types'

/**
 * `neutral` is built from `--ink-soft`, not from `--tint`.
 *
 * `--tint` is `--brand-600` — the library's single hover/active wash — so a
 * "neutral" pill built on it came out faintly blue and read as a quiet member
 * of the brand family rather than as the absence of state. Ink is the only
 * genuinely neutral thing every theme already declares, and it tracks light
 * and dark for free.
 */
const soft: Record<PillTone, string> = {
  brand: 'border-transparent bg-chip text-chip-fg',
  neutral: 'border-transparent bg-ink-soft/12 text-ink-soft',
  success: 'border-success-line bg-success-surface text-success-fg',
  warning: 'border-transparent bg-caution-surface text-caution',
  danger: 'border-transparent bg-danger/12 text-danger-fg',
  green: 'border-pill-green-line bg-pill-green-surface text-pill-green-fg',
  orange: 'border-pill-orange-line bg-pill-orange-surface text-pill-orange-fg',
  yellow: 'border-pill-yellow-line bg-pill-yellow-surface text-pill-yellow-fg',
  red: 'border-pill-red-line bg-pill-red-surface text-pill-red-fg',
}

const outline: Record<PillTone, string> = {
  brand: 'border-chip-fg/40 text-chip-fg',
  neutral: 'border-ink-soft/35 text-ink-soft',
  success: 'border-success-line text-success-fg',
  warning: 'border-caution-line text-caution',
  danger: 'border-danger/40 text-danger-fg',
  green: 'border-pill-green-line text-pill-green-fg',
  orange: 'border-pill-orange-line text-pill-orange-fg',
  yellow: 'border-pill-yellow-line text-pill-yellow-fg',
  red: 'border-pill-red-line text-pill-red-fg',
}

const dots: Record<PillTone, string> = {
  brand: 'bg-chip-fg',
  neutral: 'bg-ink-soft',
  success: 'bg-success',
  warning: 'bg-caution',
  danger: 'bg-danger-fg',
  green: 'bg-pill-green-fg',
  orange: 'bg-pill-orange-fg',
  yellow: 'bg-pill-yellow-fg',
  red: 'bg-pill-red-fg',
}

const variants: Record<PillVariant, Record<PillTone, string>> = { soft, outline }

function plainText(value: PillProps['children']): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    const text = value.map(plainText).filter(Boolean).join('')
    return text || undefined
  }
  return undefined
}

const sizes = {
  sm: {
    root: 'h-6 gap-1.5 px-2.5 text-[11.5px]',
    avatar: '-ml-1.5 size-4 text-[9px]',
    leading: '-ml-1 size-3.5',
    close: '-mr-2 size-6',
    icon: 10,
  },
  md: {
    root: 'h-8 gap-2 px-3 text-[13px]',
    avatar: '-ml-2 size-6 text-[11px]',
    leading: '-ml-1.5 size-4',
    close: '-mr-2 size-6',
    icon: 12,
  },
  lg: {
    root: 'h-9 gap-2 px-3.5 text-[13px]',
    avatar: '-ml-2.5 size-7 text-[12px]',
    leading: '-ml-1.5 size-4',
    close: '-mr-2.5 size-7',
    icon: 13,
  },
} as const

/**
 * A small piece of state in a rounded label — a row's status, a tag, a count
 * qualifier.
 *
 * Named `Pill` rather than `StatusPill` because status is one thing it says,
 * not what it is: the same shape carries a plan tier, a region, an environment
 * badge. A name that describes the shape survives the second use case; one
 * that describes the first use case gets a sibling component.
 *
 * Colour never carries the meaning alone — the label is always present, so a
 * pill reads the same to someone who cannot separate the tones. `dot` is there
 * for scanning speed, not as a second channel.
 *
 * `onClick` makes the whole pill a native button. `onClose` instead keeps the
 * label presentational and adds a real trailing dismiss button. The two modes
 * are mutually exclusive so the component never nests one button in another.
 */
export function Pill({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  leadingIcon,
  avatar,
  onClick,
  onClose,
  closeLabel,
  className = '',
  children,
  ...rest
}: PillProps) {
  const metrics = sizes[size]
  const childLabel = plainText(children)
  const cls = [
    'inline-flex max-w-full shrink-0 items-center rounded-control border font-bold whitespace-nowrap',
    metrics.root,
    variants[variant][tone],
    onClick ? 'cursor-pointer transition hover:brightness-95 active:brightness-90' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {avatar && <span className={`inline-grid shrink-0 ${metrics.avatar}`}>{avatar}</span>}
      {leadingIcon && (
        <span
          aria-hidden="true"
          className={`inline-grid shrink-0 place-items-center [&>svg]:size-full ${metrics.leading}`}
        >
          {leadingIcon}
        </span>
      )}
      {dot && (
        <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dots[tone]}`} />
      )}
      <span className="min-w-0 overflow-hidden text-ellipsis">{children}</span>
      {onClose && (
        <button
          type="button"
          className={`inline-grid shrink-0 cursor-pointer place-items-center rounded-full text-current opacity-65 transition hover:bg-current/10 hover:opacity-100 ${metrics.close}`}
          aria-label={closeLabel ?? (childLabel ? `Remove ${childLabel}` : 'Remove pill')}
          onClick={(event) => {
            event.stopPropagation()
            onClose(event)
          }}
        >
          <XIcon width={metrics.icon} height={metrics.icon} strokeWidth={2.4} />
        </button>
      )}
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} {...rest}>
        {content}
      </button>
    )
  }

  return (
    <span className={cls} {...rest}>
      {content}
    </span>
  )
}
