// Pure, framework-agnostic helpers for highlighting passages of markdown
// (used for the cited source docs in the reference panel). Kept separate from
// React so the offset math is easy to reason about (and test) on its own.
//
// The whole point: highlight offsets index the *original* markdown. The naive
// approach — inserting `==` (or any wrapper) around each range in place —
// shifts every later range by the number of characters inserted, so the second
// range lands `start+N` too far. `markRanges` sidesteps that entirely by
// rebuilding the string from the original offsets in one pass, so no range ever
// moves the goalposts for another.

import type { Highlight, Source } from './types'

/** A resolved span to wrap, as offsets into the answer text. */
export type HighlightRange = { start: number; end: number }

// Wrapper emitted around a highlighted span. Rendered as a real element once
// react-markdown reparses raw HTML (see Markdown.tsx). `data-hl` is the hook a
// surface can use to find the active highlight.
const OPEN = '<mark data-hl="true">'
const CLOSE = '</mark>'

/**
 * The ranges to highlight for a given citation marker. Finds the highlight
 * group whose `referenceNumber` matches (one chip → many sections), clamps its
 * sections to the text, drops empties, sorts by start, and removes overlaps so
 * `markRanges` can rebuild in a single clean pass.
 */
export function rangesForReference(
  highlights: Highlight[] | undefined,
  referenceNumber: number | null,
  textLength: number,
): HighlightRange[] {
  if (!highlights?.length || referenceNumber == null) return []
  const group = highlights.find((h) => h.referenceNumber === referenceNumber)
  if (!group) return []

  const clamped = group.sections
    .map((s) => ({
      start: Math.max(0, Math.min(s.start, textLength)),
      end: Math.max(0, Math.min(s.end, textLength)),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start)

  // Drop any range that overlaps the one before it — a rebuild pass needs
  // strictly non-overlapping, ascending spans.
  const out: HighlightRange[] = []
  for (const r of clamped) {
    const last = out[out.length - 1]
    if (!last || r.start >= last.end) out.push(r)
  }
  return out
}

/**
 * Wraps each range of `text` in a `<mark>`, rebuilding the string from the
 * original offsets so multiple ranges never drift. `ranges` must be ascending
 * and non-overlapping (see `rangesForReference`).
 */
export function markRanges(text: string, ranges: HighlightRange[]): string {
  if (!ranges.length) return text
  let out = ''
  let cursor = 0
  for (const { start, end } of ranges) {
    if (start < cursor) continue // defensive: skip stragglers that overlap
    out += text.slice(cursor, start) + OPEN + text.slice(start, end) + CLOSE
    cursor = end
  }
  return out + text.slice(cursor)
}

/**
 * Authoring helper for mock data: turns `{ referenceNumber, phrase }` specs
 * into the nested highlight shape by locating each phrase in the matching
 * source's markdown (the source whose `id` equals `referenceNumber`). Sections
 * are grouped by `referenceNumber` and each gets a unique running `idx`. Keeps
 * mock offsets correct without hand-counting; unfound phrases are skipped.
 */
export function sourceHighlights(
  sources: Source[],
  specs: { referenceNumber: number; phrase: string }[],
): Highlight[] {
  const groups = new Map<number, Highlight>()
  let idx = 1
  for (const { referenceNumber, phrase } of specs) {
    const source = sources.find((s) => s.id === referenceNumber)
    if (!source) continue
    const start = source.markdown.indexOf(phrase)
    if (start === -1) continue
    const section = { idx: idx++, start, end: start + phrase.length }
    const group = groups.get(referenceNumber)
    if (group) group.sections.push(section)
    else groups.set(referenceNumber, { referenceNumber, sections: [section] })
  }
  return [...groups.values()]
}

// ---------------------------------------------------------------------------
// Previews — the same cited passages, rendered somewhere that can't take
// markdown (today: the citation chip's hover card).
// ---------------------------------------------------------------------------

/**
 * Markdown → one readable line of text.
 *
 * This is not a markdown parser and shouldn't become one: its input is an
 * arbitrary *slice* of a document, so it has to survive a `**` whose closer was
 * cut off, a table row ending mid-cell, a heading with no body. Every rule here
 * strips syntax rather than interpreting it, which is exactly what makes it
 * slice-proof.
 *
 * Running the slice through the real renderer instead would be worse in three
 * ways: it renders the broken halves literally, it re-linkifies any `[n]` in
 * the source (a citation chip inside a citation chip's own tooltip), and it
 * pays for a full remark parse on the frame the card opens.
 */
export function plainExcerpt(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code: nothing quotable in it
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images → their text
    .replace(/^\s{0,3}#{1,6}\s+(.*)$/gm, '$1 · ') // headings keep their text, not their rank
    .replace(/^\s{0,3}>\s?/gm, '') // blockquote markers
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, '') // list bullets
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, ' ') // table delimiter rows
    .replace(/\s*\|\s*/g, ' · ') // cells: a separator that reads inline
    .replace(/(\*\*|__|~~|\*|_)/g, '') // emphasis, including halves left by a cut
    .replace(/\s+/g, ' ')
    .trim()
}

/** Cut at a word boundary so a preview never ends mid-word. */
function clip(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const space = cut.lastIndexOf(' ')
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/** What a citation marker shows before you open it. */
export type CitationPreview = {
  sourceId: number
  title: string
  /** Cited passages in document order, as plain text. Empty when this source
   *  has no highlight group — not every cited source does. */
  passages: string[]
  /** Passages dropped by the cap, for a "+N more" line. */
  more: number
  /** The document's opening. Set only when `passages` is empty, and never
   *  presented as a quotation — the assistant didn't cite it. */
  lead?: string
  /** The source's own link, carried through so the card can offer "Open
   *  original" without a second lookup. Absent when the source has none. */
  url?: string
}

const MAX_PASSAGES = 3

/**
 * The preview for one cited source. Reuses `rangesForReference`, so a card and
 * the reference panel can never disagree about which passages a citation
 * covers — same clamping, same ordering, same overlap removal.
 */
export function citationPreview(
  source: Source,
  highlights: Highlight[] | undefined,
  limit = 180,
): CitationPreview {
  const ranges = rangesForReference(highlights, source.id, source.markdown.length)
  const passages = ranges
    .slice(0, MAX_PASSAGES)
    .map((r) => clip(plainExcerpt(source.markdown.slice(r.start, r.end)), limit))
    .filter(Boolean)

  if (passages.length > 0) {
    return {
      sourceId: source.id,
      title: source.title,
      passages,
      more: ranges.length - passages.length,
      url: source.url,
    }
  }

  // Fallback: the document's opening, minus a leading `# Title` line that would
  // only repeat the title the card already shows above it.
  const body = source.markdown.replace(/^\s*#{1,6}\s+.*(?:\n|$)/, '')
  return {
    sourceId: source.id,
    title: source.title,
    passages: [],
    more: 0,
    lead: clip(plainExcerpt(body), limit + 40),
    url: source.url,
  }
}

/**
 * A preview as one line of text, for the marker's accessible description.
 * Lives here rather than in the card so the two can't drift — and so the card
 * file stays a component file (fast refresh only works when one does).
 */
export function previewDescription(preview: CitationPreview): string {
  const body = preview.passages.length > 0 ? preview.passages.join(' ') : (preview.lead ?? '')
  return `${preview.title}. ${body}`
}
