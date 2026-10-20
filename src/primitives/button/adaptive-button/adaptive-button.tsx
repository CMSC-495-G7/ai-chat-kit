import { Tooltip } from '../../tooltip'
import { Button } from '../button'
import type { AdaptiveButtonCollapse, AdaptiveButtonProps, ButtonSize } from '../types'

const compactBox: Record<AdaptiveButtonCollapse, Record<ButtonSize, string>> = {
  sm: {
    sm: '@max-[30rem]:w-8 @max-[30rem]:px-0',
    md: '@max-[30rem]:w-9 @max-[30rem]:px-0',
    lg: '@max-[30rem]:w-11 @max-[30rem]:px-0',
  },
  md: {
    sm: '@max-[40rem]:w-8 @max-[40rem]:px-0',
    md: '@max-[40rem]:w-9 @max-[40rem]:px-0',
    lg: '@max-[40rem]:w-11 @max-[40rem]:px-0',
  },
  lg: {
    sm: '@max-[52rem]:w-8 @max-[52rem]:px-0',
    md: '@max-[52rem]:w-9 @max-[52rem]:px-0',
    lg: '@max-[52rem]:w-11 @max-[52rem]:px-0',
  },
}

const compactLabel: Record<AdaptiveButtonCollapse, string> = {
  sm: '@max-[30rem]:sr-only',
  md: '@max-[40rem]:sr-only',
  lg: '@max-[52rem]:sr-only',
}

/**
 * A labelled Button that falls back to an icon-only box when its nearest CSS
 * query container becomes constrained. The caller owns that layout decision
 * by placing `@container` on the local toolbar or action group.
 *
 * It remains one native button across both presentations, preserving focus,
 * pressed state and event identity. The label remains its accessible name, and
 * the supplementary tooltip is portalled through the shared overlay layer.
 */
export function AdaptiveButton({
  label,
  icon,
  collapseAt = 'sm',
  tooltip = label,
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel = label,
  ...rest
}: AdaptiveButtonProps) {
  return (
    <Tooltip content={tooltip} disabled={disabled}>
      <Button
        {...rest}
        size={size}
        icon={icon}
        aria-label={ariaLabel}
        disabled={disabled}
        className={[compactBox[collapseAt][size], className].filter(Boolean).join(' ')}
      >
        <span className={compactLabel[collapseAt]}>{label}</span>
      </Button>
    </Tooltip>
  )
}
