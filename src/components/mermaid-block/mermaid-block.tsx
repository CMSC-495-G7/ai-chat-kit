import { lazy, Suspense } from 'react'
import { MermaidPending } from './frame'
import { describeDiagram } from './source'
import type { MermaidBlockProps } from './types'

// The renderer is ~470 kB gz (elkjs is most of it), so the page loads it the
// first time a diagram appears rather than with the chat. The widget ships as
// one file, so there the same import is simply inlined.
const MermaidDiagram = lazy(() => import('./mermaid-diagram'))

/**
 * A ```mermaid fence, drawn. Streams: only finished lines are drawn, the last
 * good frame holds while the next line is still invalid, and an error is only
 * reported once the fence closes — as the source, with one plain sentence.
 */
export function MermaidBlock(props: MermaidBlockProps) {
  return (
    <Suspense
      fallback={
        <MermaidPending
          label={props.label ?? describeDiagram(props.code).label}
          message={props.labels?.drawing}
        />
      }
    >
      <MermaidDiagram {...props} />
    </Suspense>
  )
}
