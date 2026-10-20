import { useState, type ReactNode } from 'react'

/**
 * Holds the draft on its way from the composer to the dock's ghost row.
 *
 * A component of its own rather than state in the page, because a keystroke
 * has to re-render the composer and the dock and nothing else — the transcript
 * above them is a list of unmemoized messages, and putting every one of them
 * through React on every character typed is how a composer starts to lag.
 */
export function QueueDraft({
  children,
}: {
  children: (draft: string, onDraftChange: (text: string) => void) => ReactNode
}) {
  const [draft, setDraft] = useState('')
  return <>{children(draft, setDraft)}</>
}
