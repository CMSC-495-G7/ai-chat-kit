import type { TurnTrace } from '../../engine/types'

export type TurnTraceHandleProps = {
  trace: TurnTrace
  open: boolean
  onToggle: () => void
}

export type TurnTracePanelProps = {
  trace: TurnTrace
  open: boolean
}

export type TurnTraceFailureProps = {
  /** Why the turn produced nothing, in the responder's own words. */
  reason: string
  /** What the turn managed before it died. Absent or empty when it never
   *  started, in which case no timeline is drawn. */
  trace?: TurnTrace
  /** When provided, the failure offers a Retry that re-runs the turn. */
  onRetry?: () => void
  /** Held while another turn is in flight, so Retry can't jump the send queue. */
  busy?: boolean
}
