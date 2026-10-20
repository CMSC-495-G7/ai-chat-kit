import type { ReactNode } from 'react'
import { CircleCheckIcon, CircleInfoIcon, CircleXIcon, TriangleAlertIcon, XIcon } from '../icons'
import { IconButton } from '../icon-button'
import { useUiSize } from '../../lib/uiSize'
import type { NoticeProps, NoticeTone } from './types'

const tones: Record<NoticeTone, { band: string; ink: string; glyph: ReactNode }> = {
  info: {
    band: 'border-brand-fg/25 bg-brand-fg/7',
    ink: 'text-brand-fg',
    glyph: <CircleInfoIcon width={16} height={16} />,
  },
  success: {
    band: 'border-success-line bg-success-surface',
    ink: 'text-success-fg',
    glyph: <CircleCheckIcon width={16} height={16} />,
  },
  warning: {
    band: 'border-caution-line bg-caution-surface',
    ink: 'text-caution',
    glyph: <TriangleAlertIcon width={16} height={16} />,
  },
  error: {
    band: 'border-danger/25 bg-danger/8',
    ink: 'text-danger-fg',
    glyph: <CircleXIcon width={16} height={16} />,
  },
}

/**
 * A one-line status band: the whole strip takes the tone, a glyph leads, and
 * an optional tag names the state in words. Sized for a message flow — a
 * conversation, a panel, the top of a list — where a full `Alert` would be
 * too much. One inline action at most; anything needing a list, details or a
 * primary button is an `Alert`.
 */
export function Notice({
  tone = 'info',
  children,
  label,
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  className = '',
  role = tone === 'error' ? 'alert' : 'status',
  ...rest
}: NoticeProps) {
  const compact = useUiSize() === 'compact'
  const treatment = tones[tone]

  return (
    <div
      role={role}
      data-tone={tone}
      className={[
        'flex min-w-0 items-start gap-2.5 rounded-surface border',
        treatment.band,
        compact ? 'px-3 py-2' : 'px-3.5 py-2.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon !== false && (
        <span
          aria-hidden="true"
          className={`inline-grid h-5 shrink-0 place-items-center ${treatment.ink}`}
        >
          {icon ?? treatment.glyph}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={`min-w-0 leading-5 font-bold [overflow-wrap:anywhere] text-ink-strong ${compact ? 'text-[12.5px]' : 'text-[13.5px]'}`}
        >
          {children}
        </span>
        {label != null && (
          <span
            className={`h-5 max-w-full min-w-0 truncate rounded-[5px] bg-panel-solid px-1.5 leading-5 text-[10.5px] font-black tracking-[0.07em] uppercase ${treatment.ink}`}
          >
            {label}
          </span>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            className={`ml-auto text-[12.5px] leading-5 font-extrabold whitespace-nowrap underline-offset-3 hover:underline ${treatment.ink}`}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <IconButton
          onClick={onDismiss}
          aria-label={dismissLabel}
          title={dismissLabel}
          size="sm"
          className={`-my-1 -mr-1.5 shrink-0 ${treatment.ink}`}
        >
          <XIcon width={13} height={13} />
        </IconButton>
      )}
    </div>
  )
}
