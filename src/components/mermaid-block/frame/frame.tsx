import type { ReactNode } from 'react'

/**
 * The box every state of a diagram shares — drawing, drawn, or shown as
 * source — so switching between them never changes the block's outline.
 */
export function MermaidFrame({
  label,
  actions,
  busy,
  children,
}: {
  label: string
  actions?: ReactNode
  busy?: boolean
  children: ReactNode
}) {
  return (
    <figure
      aria-busy={busy || undefined}
      className="my-3 overflow-hidden rounded-surface border border-line bg-code-block"
    >
      <figcaption className="flex h-9 items-center gap-1 border-b border-line pr-1 pl-3.5 text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
        <span className="flex-1 truncate">{label}</span>
        {actions}
      </figcaption>
      {children}
    </figure>
  )
}

/**
 * Everything a diagram shows before it is finished, in one fixed-height box.
 *
 * Fixed because the alternative moves the page: a diagram drawn line by line
 * changes height with every line, pushing the text below it down and making
 * the transcript's scroll chase it — a burst of layout shifts per diagram,
 * which is exactly the motion that is hard on vestibular and attention
 * sensitivities. This box holds one size from the placeholder to the last
 * streamed line, so the only layout change is the finished diagram
 * replacing it, once.
 */
export function DrawingBox({
  children,
  message = 'Drawing diagram…',
}: {
  children?: ReactNode
  message?: string
}) {
  return (
    <div className="relative h-48 overflow-hidden">
      {children}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="shimmer-text text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}

/** Before the first frame is drawable — and while the renderer itself loads. */
export function MermaidPending({ label, message }: { label: string; message?: string }) {
  return (
    <MermaidFrame label={label} busy>
      <DrawingBox message={message} />
    </MermaidFrame>
  )
}
