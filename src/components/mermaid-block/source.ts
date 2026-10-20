/** What a diagram is called, and whether the renderer can draw it. */
export type DiagramKind = { label: string; drawable: boolean }

// The header keyword, in the order mermaid documents them. Drawable is what
// beautiful-mermaid renders — checked against the library, not its docs: its
// parse error for everything else names only flowcharts, so it cannot be shown
// to a reader as-is.
const KINDS: [RegExp, string, boolean][] = [
  [/^(flowchart|graph)\b/, 'Flowchart', true],
  [/^sequenceDiagram\b/, 'Sequence diagram', true],
  [/^classDiagram\b/, 'Class diagram', true],
  [/^stateDiagram(-v2)?\b/, 'State diagram', true],
  [/^erDiagram\b/, 'Entity relationship diagram', true],
  [/^xychart(-beta)?\b/, 'Chart', true],
  [/^pie\b/, 'Pie chart', false],
  [/^gantt\b/, 'Gantt chart', false],
  [/^gitGraph\b/, 'Git graph', false],
  [/^mindmap\b/, 'Mind map', false],
  [/^timeline\b/, 'Timeline', false],
  [/^journey\b/, 'User journey', false],
  [/^quadrantChart\b/, 'Quadrant chart', false],
  [/^sankey(-beta)?\b/, 'Sankey diagram', false],
]

/** Statement lines: not blank, not a `%%` comment. */
function statements(code: string): string[] {
  return code.split('\n').filter((line) => line.trim() && !line.trim().startsWith('%%'))
}

export function describeDiagram(code: string): DiagramKind {
  const header = statements(code)[0]?.trim() ?? ''
  for (const [pattern, label, drawable] of KINDS) {
    if (pattern.test(header)) return { label, drawable }
  }
  return { label: 'Diagram', drawable: true }
}

/**
 * The part of a still-arriving source that is safe to draw: every line up to
 * the last newline. Mermaid is line-based, so a half-typed token can never
 * break the render, and the diagram re-lays-out once per finished line rather
 * than once per token.
 */
export function completeLines(code: string): string {
  const end = code.lastIndexOf('\n')
  return end === -1 ? '' : code.slice(0, end)
}

/** A header alone draws an empty frame; wait for something to put in it. */
export function hasBody(code: string): boolean {
  return statements(code).length > 1
}
