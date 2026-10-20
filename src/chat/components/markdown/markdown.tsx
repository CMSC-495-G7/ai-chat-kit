import { createContext, useContext, useMemo, type ComponentProps } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Source } from '../../engine/types'
import { citationPreview, markRanges, type CitationPreview } from '../../engine/highlights'
import { useHighlightRanges } from '../../engine/useHighlights'
import { CitationChip } from '../citation-chip'
import type { CitationPreviewLookup } from '../citation-chip'
import { MermaidBlock } from '../../../components/mermaid-block'
import { useUiSize } from '../../../lib/uiSize'
import { isClosedFence, mapProse } from './fences'
import type { MarkdownProps } from './types'

/**
 * Rewrites [n] markers into markdown links ([n](#cite-n)) that the `a`
 * component below turns into CitationChips. Only numbers matching a real
 * source id are rewritten, so bracketed prose like [sic] passes through.
 * While streaming, a half-received trailing marker ("[" / "[12") is hidden
 * so it never flickers as plain text.
 *
 * Fenced blocks are left alone: `A[1]` is a mermaid node, not a citation, and
 * rewriting it would break the diagram. Markers inside inline code spans
 * would still be rewritten; the canned demo data keeps [n] out of those.
 */
function linkifyCitations(text: string, sources: Source[] | undefined, streaming: boolean): string {
  const ids = new Set(sources?.map((s) => s.id))
  return mapProse(text, (prose, last) => {
    let out = ids.size
      ? prose.replace(/\[(\d+)\]/g, (match, n) =>
          ids.has(Number(n)) ? `[${n}](#cite-${n})` : match,
        )
      : prose
    if (streaming && last) out = out.replace(/\[\d*$/, '')
    return out
  })
}

const CITE_PREFIX = '#cite-'

/**
 * What `Pre` needs to know about the whole message. A context rather than a
 * closure because of how react-markdown uses `components`: each entry is a
 * component *type*, and `Markdown` rebuilds that object every render — so an
 * inline `pre` would be a new type on every streamed token, and React would
 * remount everything under it. A diagram would lose the frame it is holding,
 * once per token. `Pre` lives at module level and never changes identity.
 */
const BlockContext = createContext<{ source: string; streaming: boolean }>({
  source: '',
  streaming: false,
})

function Pre({ node, children }: ComponentProps<'pre'> & ExtraProps) {
  const { source, streaming } = useContext(BlockContext)
  const compact = useUiSize() === 'compact'
  const code = node?.children[0]
  const lang =
    code?.type === 'element' && Array.isArray(code.properties.className)
      ? code.properties.className
      : []

  if (code?.type === 'element' && lang.includes('language-mermaid')) {
    const text = code.children.map((c) => (c.type === 'text' ? c.value : '')).join('')
    const { start, end } = node?.position ?? {}
    // Positions index the markdown actually rendered, so slicing it gives the
    // fence as written — closing line included, once it has arrived.
    const closed =
      start?.offset != null &&
      end?.offset != null &&
      isClosedFence(source.slice(start.offset, end.offset))
    return <MermaidBlock code={text.replace(/\n$/, '')} streaming={streaming && !closed} />
  }

  return (
    <pre
      className={`my-3 overflow-x-auto rounded-surface border border-line bg-code-block p-3.5 font-mono leading-relaxed [&>code]:bg-transparent [&>code]:p-0 ${compact ? 'text-xs' : 'text-[13px]'}`}
    >
      {children}
    </pre>
  )
}

/** Shared markdown renderer for assistant messages and reference documents. */
export function Markdown({
  text,
  streaming,
  sources,
  onCite,
  highlights,
  activeRef = null,
}: MarkdownProps) {
  const compact = useUiSize() === 'compact'

  // Ranges are resolved against the original `text`, then wrapped in <mark>
  // *before* citation linkify, so highlight offsets are never disturbed by the
  // [n] → [n](#cite-n) rewrite. Rebuilding from original offsets (markRanges)
  // is what keeps multiple ranges from drifting.
  const ranges = useHighlightRanges(highlights, activeRef, text.length)
  const rendered = linkifyCitations(markRanges(text, ranges), sources, !!streaming)

  // Previews are resolved lazily, per chip, when a card is about to open — so
  // a streaming answer carrying ten markers doesn't slice and clean ten
  // passages on every token. The cache makes a second hover of the same chip
  // free.
  const previewFor = useMemo<CitationPreviewLookup>(() => {
    const cache = new Map<number, CitationPreview | null>()
    return (id) => {
      if (!cache.has(id)) {
        const source = sources?.find((s) => s.id === id)
        cache.set(id, source ? citationPreview(source, highlights) : null)
      }
      return cache.get(id) ?? null
    }
  }, [sources, highlights])

  const components: Components = {
    // Highlighted source passage. `data-hl` lets a surface scroll to it.
    mark: ({ children }) => (
      <mark data-hl className="highlight-wash rounded px-0.5 text-ink-strong transition-colors">
        {children}
      </mark>
    ),
    a: ({ href, children }) => {
      if (href?.startsWith(CITE_PREFIX)) {
        const id = Number(href.slice(CITE_PREFIX.length))
        return <CitationChip n={id} preview={previewFor} onClick={() => onCite?.(id)} />
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-brand-fg underline decoration-brand-fg/40 underline-offset-2 transition hover:decoration-brand-fg"
        >
          {children}
        </a>
      )
    },
    p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,
    h1: ({ children }) => (
      <h1 className="mt-5 mb-2 text-lg font-semibold text-ink-strong first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-5 mb-2 text-base font-semibold text-ink-strong first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-4 mb-1.5 font-semibold text-ink-strong first:mt-0">{children}</h3>
    ),
    ul: ({ children }) => <ul className="my-2.5 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="my-2.5 list-decimal space-y-1 pl-5">{children}</ol>,
    li: ({ children }) => <li className="[&>p]:my-0">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-ink-strong">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded bg-code px-1.5 py-0.5 font-mono text-[0.85em] text-ink-strong">
        {children}
      </code>
    ),
    pre: Pre,
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto rounded-surface border border-line">
        <table className={`w-full border-collapse ${compact ? 'text-[13px]' : 'text-sm'}`}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, style }) => (
      <th
        style={style}
        className="border-b border-line bg-tint/4 px-3 py-1.5 text-left font-semibold whitespace-nowrap text-ink-strong"
      >
        {children}
      </th>
    ),
    td: ({ children, style }) => (
      <td style={style} className="border-b border-line/60 px-3 py-1.5 align-top last:border-b-0">
        {children}
      </td>
    ),
    tr: ({ children }) => <tr className="last:[&>td]:border-b-0">{children}</tr>,
    blockquote: ({ children }) => (
      <blockquote className="turn-rail my-3 pl-4 text-ink-soft italic">{children}</blockquote>
    ),
    hr: () => <hr className="my-4 border-line" />,
  }

  return (
    <BlockContext value={{ source: rendered, streaming: !!streaming }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehype-raw only when there are highlights to render, so ordinary
        // messages don't pay to reparse raw HTML.
        rehypePlugins={ranges.length ? [rehypeRaw] : undefined}
        components={components}
      >
        {rendered}
      </ReactMarkdown>
      {streaming && <span className="text-accent">▍</span>}
    </BlockContext>
  )
}
