import { Pill } from '../../../../primitives/pill'
import { QueueIcon } from '../../../../primitives/icons'
import type { QueueToggleProps } from '../types'

/**
 * The composer's way into the queue: starts building a queue — questions that
 * run one after another — or stops building one.
 *
 * The word rides along at every width, compact included. Stripped of it this
 * button is a glyph in the send cluster, which is exactly how it came to be
 * read as a second way to send; the label is the part that fixed that, and the
 * title says the whole thing once, for anyone who hovers.
 */
export function QueueToggle({ compact, pressed, onClick }: QueueToggleProps) {
  const label = pressed ? 'Stop building the queue' : 'Queue a question'
  const title = pressed
    ? 'Stop building — questions you added stay queued and paused'
    : 'Queue a question — it runs after this reply. Send interrupts instead.'
  return (
    <Pill
      size={compact ? 'md' : 'lg'}
      tone={pressed ? 'brand' : 'neutral'}
      variant={pressed ? 'soft' : 'outline'}
      leadingIcon={<QueueIcon />}
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      title={title}
    >
      {pressed ? 'Queueing' : 'Queue'}
    </Pill>
  )
}
