// What a turn did, and how long it took.
//
// The rule this file follows is that severity picks the placement, not a color.
// A turn that hiccuped and still answered is not the reader's problem, so it
// never gets a badge or a warning tint — it gets a word ("recovered") in the
// same ink as everything else. Nothing about a finished turn should make anyone
// look twice.
//
// Three views of the same trace, kept together because they share the timeline:
//   - Handle  the duration at the right of a finished turn's action row
//   - Panel   that handle's disclosure, holding the timeline
//   - Failure a turn that produced no answer
//
// The Failure view deliberately has no disclosure. When there is no answer to
// read, the timeline is not a detail hiding behind "Details" — it is the only
// content the turn has, so it is shown outright. Callers own the open state for
// the other two, which lets the handle sit at the right edge of a row while the
// panel expands full-width beneath it.

import { useState } from 'react'
import { ChevronRightIcon } from '../../../primitives/icons'
import { useUiSize } from '../../../lib/uiSize'
import type { TurnStep, TurnTrace as Trace } from '../../engine/types'
import type { TurnTraceFailureProps, TurnTraceHandleProps, TurnTracePanelProps } from './types'

/** One significant unit, always seconds — the timeline is read as a column, so
 *  the stamps have to line up rather than switch units row to row. */
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`

/** The handle's label. Lives here, not in the caller, so the wording for a
 *  given status can't drift. Only 'recovered' earns a word: a stopped turn
 *  already says so above the row, and a clean one has nothing to report beyond
 *  the time. */
function handleLabel(trace: Trace) {
  const total = secs(trace.ms ?? 0)
  return trace.status === 'recovered' ? `${total} · recovered` : total
}

/** Never contradict what the message already shows — a stopped turn renders a
 *  "Stopped" label right above this panel. The two are kept apart because
 *  "stopped" describes the reader's own action. ChatMessage routes failed turns
 *  to TurnTraceFailure rather than here, but the case is covered so the panel
 *  stays correct for any consumer that renders it directly. */
function headlineFor(trace: Trace) {
  const total = secs(trace.ms ?? 0)
  if (trace.status === 'failed') return `Failed after ${total}`
  if (trace.status === 'stopped') return `Stopped after ${total}`
  return `Answered in ${total}`
}

export function TurnTraceHandle({ trace, open, onToggle }: TurnTraceHandleProps) {
  const compact = useUiSize() === 'compact'
  // Nothing to show until the turn has finished timing itself.
  if (trace.ms === undefined) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`flex items-center gap-1 rounded-control px-1.5 py-1 tabular-nums text-ink-soft transition hover:bg-tint/6 ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      <span>{handleLabel(trace)}</span>
      <ChevronRightIcon
        width={12}
        height={12}
        className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        aria-hidden
      />
    </button>
  )
}

export function TurnTracePanel({ trace, open }: TurnTracePanelProps) {
  const compact = useUiSize() === 'compact'
  const text = compact ? 'text-[11px]' : 'text-xs'

  const detail = [trace.model, trace.tokens && `${trace.tokens.toLocaleString()} tokens`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden">
        <div className={`turn-rail mt-1.5 ${compact ? 'pl-3' : 'pl-4'}`}>
          <p className={`text-ink-soft ${text}`}>
            <span className="font-medium">{headlineFor(trace)}</span>
            {detail && <span> · {detail}</span>}
          </p>
          {trace.status === 'recovered' && (
            <p className={`text-ink-soft ${text}`}>The answer is complete.</p>
          )}

          <TraceSteps steps={trace.steps} className="mt-1.5" />
        </div>
      </div>
    </div>
  )
}

/**
 * A turn that produced no answer.
 *
 * No box and no tint: every other assistant turn in this UI is bare text
 * hanging off the orb, and a failure that arrives as a card reads like a system
 * notice pasted into the thread rather than a turn that went wrong.
 *
 * Instead the turn's own rail carries it. The rail runs alongside whatever the
 * turn managed to do, then frays out where the stream died — accent giving way
 * to danger, then to nothing. Below the break the text returns flush with the
 * message, because the verdict speaks to the reader rather than describing the
 * turn's interior. The eye travels: inside the turn, the thread ends, back out
 * to you.
 *
 * Exactly two things carry danger color — the frayed rail and the verdict. The
 * reason stays in ordinary ink, because it is information, not alarm.
 */
export function TurnTraceFailure({ reason, trace, onRetry, busy }: TurnTraceFailureProps) {
  const compact = useUiSize() === 'compact'
  const steps = trace?.steps ?? []

  return (
    <div className="mt-3">
      {/* Skipped entirely when the turn died before doing anything — a rail
          with nothing alongside it is a stray mark, not a timeline. */}
      {steps.length > 0 && (
        <>
          <TraceSteps steps={steps} className={`turn-rail ${compact ? 'pl-3' : 'pl-4'}`} />
          <span aria-hidden className="turn-rail-end block h-6" />
        </>
      )}

      <div role="alert" className={steps.length > 0 ? 'mt-1.5' : ''}>
        <p className={`font-medium text-danger-fg ${compact ? 'text-xs' : 'text-sm'}`}>
          Stopped before answering.
        </p>
        <p className={`mt-0.5 text-ink-soft ${compact ? 'text-[11px]' : 'text-[13px]'}`}>
          {reason}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={busy}
          className={`mt-2.5 rounded-control border border-line font-medium text-ink-soft transition hover:bg-tint/6 disabled:cursor-not-allowed disabled:opacity-50 ${
            compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-[13px]'
          }`}
        >
          Retry
        </button>
      )}
    </div>
  )
}

/** The timeline itself: `0.0s  Reasoning  1.2s` per row — when it started, what
 *  ran, how long it took. The left column is what makes this a timeline instead
 *  of a property list.
 *
 *  Which is exactly what two bare numbers on one line don't say: nothing marks
 *  the left one as a position on the turn's clock and the right one as a
 *  duration. A column header names both at once, and costs no space inside the
 *  rows — it reuses their flex skeleton, so nothing shifts. Skipped on a
 *  single-step trace, where a header over one row is furniture. */
function TraceSteps({ steps, className = '' }: { steps: TurnStep[]; className?: string }) {
  const compact = useUiSize() === 'compact'
  if (steps.length === 0) return null

  return (
    <div className={className}>
      {steps.length > 1 && <ColumnHeader />}
      <ol className={`space-y-1 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </ol>
    </div>
  )
}

/** Names the two numeric columns.
 *
 *  `aria-hidden`, and it has to be: this is a visual alignment device over an
 *  `<ol>`, not a table header a screen reader could associate with anything.
 *  Non-visual parity comes from the `sr-only` phrasing inside each row, which
 *  labels the numbers where they actually are. */
function ColumnHeader() {
  return (
    <div
      aria-hidden
      className="mb-1 flex items-baseline gap-2.5 text-[10px] font-semibold tracking-wide text-ink-soft uppercase"
    >
      <span className="w-9 shrink-0">Start</span>
      <span className="min-w-0 flex-1">Step</span>
      <span className="shrink-0">Took</span>
    </div>
  )
}

function StepRow({ step }: { step: TurnStep }) {
  const fault = step.kind === 'fault' ? step.fault : undefined
  // A fault the responder only reported at the end has no honest timestamp; an
  // em-dash says "during this turn, we don't know when" without faking one.
  const stamp = step.at === undefined ? '—' : secs(step.at)
  const [open, setOpen] = useState(false)
  const detail = fault?.detail

  const row = (
    <div className="flex items-baseline gap-2.5">
      {/* No opacity modifier anywhere in this panel: --ink-soft is already tuned
          as the AA-passing secondary ink, and stacking alpha on it drops the
          stamps to 2.74:1. Hierarchy comes from the mono face and the fixed
          column instead. */}
      <span className="w-9 shrink-0 font-mono tabular-nums">
        <span className="sr-only">Started at </span>
        {stamp}
      </span>
      <span className="min-w-0 flex-1">
        {fault ? (
          <>
            {fault.source && <span className="font-mono">{fault.source}: </span>}
            {fault.message}
            {fault.count !== undefined && fault.count > 1 && (
              <span className="font-mono"> ×{fault.count}</span>
            )}
          </>
        ) : (
          step.label
        )}
      </span>
      {!fault && step.ms !== undefined && (
        <span className="shrink-0 font-mono tabular-nums">
          <span className="sr-only">, took </span>
          {secs(step.ms)}
        </span>
      )}
      {detail && (
        <ChevronRightIcon
          width={11}
          height={11}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          aria-hidden
        />
      )}
    </div>
  )

  return (
    <li className={fault ? 'text-danger-fg-soft' : 'text-ink-soft'}>
      {detail ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          // -my-1/py-1 grows a 16px text row to a 24px target without moving
          // anything: the padding is cancelled by the negative margin, so the
          // timeline keeps its rhythm.
          className="-my-1 w-full py-1 text-left"
        >
          {row}
        </button>
      ) : (
        row
      )}

      {/* The same JSON treatment ToolCallChip gives a tool payload — one idiom
          for structured data inside a turn, not two. */}
      {detail && open && (
        <pre className="mt-1 ml-[46px] overflow-x-auto font-mono whitespace-pre-wrap">
          {JSON.stringify(detail, null, 2)}
        </pre>
      )}
    </li>
  )
}
