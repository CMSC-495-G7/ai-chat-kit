import { Notice } from '../notice'
import type { InlineTipProps } from './types'

/**
 * A small, dismissible callout for surfacing one piece of product knowledge
 * right where it's relevant — never a modal, never a tour. Generic on
 * purpose: pair it with `useDismissableTip` under a surface-specific key
 * (see the citation-discovery tip in ChatMessage) for any "here's how this
 * works" moment worth saying once and then staying out of the way — scope
 * changes, retry behavior, whatever comes next — rather than growing a new
 * one-off banner per feature.
 */
export function InlineTip({
  icon,
  children,
  onDismiss,
  dismissLabel = 'Dismiss tip',
}: InlineTipProps) {
  return (
    <Notice
      tone="info"
      icon={icon ?? false}
      onDismiss={onDismiss}
      dismissLabel={dismissLabel}
      role="note"
    >
      <span className="font-normal text-ink">{children}</span>
    </Notice>
  )
}
