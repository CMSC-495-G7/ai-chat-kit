import { useMemo } from 'react'
import { withDefaults } from '../../lib/withDefaults'
import { looksLikeHtml, sanitizeRichText } from './rich-text'
import type {
  Article,
  ArticleField,
  ArticleFieldKind,
  ArticlePreviewLabels,
  ArticlePreviewProps,
} from './types'

// Every kind this version draws. A Record, so adding a kind to the type without
// listing it here fails to compile.
const KNOWN: Record<ArticleFieldKind, true> = {
  text: true,
  richText: true,
  boolean: true,
  date: true,
  dateTime: true,
  link: true,
}
const WEB_ADDRESS = /^https?:\/\/\S+$/i
const MAIL_ADDRESS = /^mailto:\S+$/i
// Past this a text value stops being a fact beside its label and becomes a passage.
const PASSAGE = 80

/** The kind a field is drawn as: the one it declares, or else what its value turns out to be. */
function kindOf({ kind, value }: ArticleField): ArticleFieldKind {
  const text = value ?? ''
  const declared = kind && Object.hasOwn(KNOWN, kind) ? kind : undefined
  // The only addresses a link field may open. Anything else is shown as text.
  if (declared === 'link')
    return WEB_ADDRESS.test(text) || MAIL_ADDRESS.test(text) ? 'link' : 'text'
  if (declared) return declared
  if (looksLikeHtml(text)) return 'richText'
  return WEB_ADDRESS.test(text) ? 'link' : 'text'
}

function defaultFormatDate(value: string, kind: 'date' | 'dateTime') {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return kind === 'dateTime'
    ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : // A bare date is a calendar day, not a moment: read in UTC so a reader
      // west of Greenwich doesn't see the day before.
      date.toLocaleDateString(undefined, { dateStyle: 'medium', timeZone: 'UTC' })
}

type Drawn = { field: ArticleField; kind: ArticleFieldKind }
type Block = { wide: true; item: Drawn } | { wide: false; items: Drawn[] }

/**
 * The fields as the sheet lays them out: a passage or rich text takes the full
 * width under its label; the short facts between two of those share a grid.
 * The article's own order is kept throughout.
 */
function layOut(article: Article, showEmpty: boolean): Block[] {
  const blocks: Block[] = []
  for (const field of article.fields) {
    const text = field.value ?? ''
    if (!text.trim() && !showEmpty) continue
    const kind = kindOf(field)
    const wide =
      kind === 'richText' || (kind === 'text' && (text.length > PASSAGE || /\n/.test(text)))
    const item = { field, kind }
    const last = blocks[blocks.length - 1]
    if (wide) blocks.push({ wide, item })
    else if (last && !last.wide) last.items.push(item)
    else blocks.push({ wide, items: [item] })
  }
  return blocks
}

/**
 * A knowledge article drawn from its fields: a title and what is known about
 * it, then each field under its label, in the article's own order. It takes
 * the article as data and fetches nothing. Like DocumentPreview it scrolls
 * itself, so it wants a parent with a height.
 *
 * Experimental. It has only been drawn from sample data, never from a real
 * knowledge base, so its props, the `Article` shape and the field kinds may
 * change without a deprecation step once real articles are put through it.
 *
 * The sheet is white in both colour modes, as a PDF page is: an article's rich
 * text carries its author's own colours, and those assume a light page.
 */
export function ArticlePreview({
  article,
  zoom = 1,
  showEmpty = false,
  formatDate = defaultFormatDate,
  labels: overrides,
  className = '',
}: ArticlePreviewProps) {
  const labels = withDefaults<ArticlePreviewLabels>(
    {
      region: (title) => `Article: ${title}`,
      number: (number) => `Article ${number}`,
      version: (version) => `Version ${version}`,
      published: (date) => `Published ${date}`,
      yes: 'Yes',
      no: 'No',
      empty: '—',
    },
    overrides,
  )
  const blocks = useMemo(() => layOut(article, showEmpty), [article, showEmpty])
  const facts = [
    article.number && labels.number(article.number),
    article.version != null && labels.version(article.version),
    article.publishedAt && labels.published(formatDate(article.publishedAt, 'date')),
  ].filter(Boolean)

  const value = ({ field, kind }: Drawn) => {
    const text = field.value ?? ''
    if (!text.trim()) return <span className="text-(--article-soft)">{labels.empty}</span>
    if (kind === 'richText') return <RichText html={text} />
    if (kind === 'boolean') return text.trim().toLowerCase() === 'true' ? labels.yes : labels.no
    if (kind === 'date' || kind === 'dateTime') return formatDate(text, kind)
    if (kind === 'link')
      return (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="article-link [overflow-wrap:anywhere]"
        >
          {text}
        </a>
      )
    return <span className="whitespace-pre-line">{text}</span>
  }

  return (
    <div
      role="group"
      aria-label={labels.region(article.title)}
      // A scroll box with nothing focusable inside is out of a keyboard's reach.
      tabIndex={0}
      className={`flex min-h-0 flex-1 flex-col overflow-auto bg-code-block [scrollbar-gutter:stable] focus-visible:-outline-offset-2 ${className}`}
    >
      <div className="p-4">
        <article
          style={{ zoom }}
          // `contain-paint` clips to the sheet: whatever an author's inline
          // styles do — a negative margin, a transform — stays inside it.
          className="article-preview @container bg-white p-7 text-[15px] leading-relaxed text-(--article-ink) shadow-sm ring-1 ring-line contain-paint"
        >
          <header className="border-b border-(--article-line) pb-5">
            {article.type && (
              <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-(--article-soft) uppercase">
                {article.type}
              </p>
            )}
            <h2 className="text-[22px] leading-tight font-bold text-balance">{article.title}</h2>
            {facts.length > 0 && (
              <p className="mt-2 text-[12.5px] text-(--article-soft)">{facts.join(' · ')}</p>
            )}
            {article.summary && <p className="mt-3 whitespace-pre-line">{article.summary}</p>}
          </header>

          {blocks.map((block) =>
            block.wide ? (
              <section key={block.item.field.name} className="mt-6">
                <h3 className="mb-1.5 text-[12.5px] font-semibold text-(--article-soft)">
                  {block.item.field.label}
                </h3>
                {/* Rich text brings its own blocks; anything else is one paragraph. */}
                {block.item.kind === 'richText' ? value(block.item) : <p>{value(block.item)}</p>}
              </section>
            ) : (
              <dl
                key={block.items[0].field.name}
                className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 @xs:grid-cols-2"
              >
                {block.items.map((item) => (
                  <div key={item.field.name} className="min-w-0">
                    <dt className="text-[12.5px] font-semibold text-(--article-soft)">
                      {item.field.label}
                    </dt>
                    <dd className="mt-0.5">{value(item)}</dd>
                  </div>
                ))}
              </dl>
            ),
          )}
        </article>
      </div>
    </div>
  )
}

/** A rich text field, sanitised. Its typography is article-preview.css. */
function RichText({ html }: { html: string }) {
  const safe = useMemo(() => sanitizeRichText(html), [html])
  return <div className="article-rich-text" dangerouslySetInnerHTML={{ __html: safe }} />
}
