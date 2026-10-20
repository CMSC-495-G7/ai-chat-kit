import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon } from '../icons'
import { IconButton } from '../icon-button'
import type { CopyButtonProps } from './types'

/**
 * Copy-to-clipboard with its own confirmation.
 *
 * Extracted because three surfaces wanted it and two had drifted: the glyph
 * swap is invisible to a screen reader, so the confirmation has to be spoken
 * as well as drawn, and the revert timer has to be cleared on unmount — a
 * message can leave the transcript inside the 1.5 seconds.
 */
export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  holdMs = 1500,
  iconSize = 15,
  size = 'md',
  shape = 'rounded',
  onCopied,
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return (
    <>
      <IconButton
        {...rest}
        size={size}
        shape={shape}
        aria-label={copied ? copiedLabel : label}
        title={copied ? copiedLabel : label}
        onClick={() => {
          navigator.clipboard?.writeText(text)
          onCopied?.(text)
          setCopied(true)
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), holdMs)
        }}
      >
        {copied ? (
          <CheckIcon width={iconSize} height={iconSize} className="text-success-fg" />
        ) : (
          <CopyIcon width={iconSize} height={iconSize} />
        )}
      </IconButton>
      {/* The whole confirmation, for anyone not watching the glyph. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </>
  )
}
