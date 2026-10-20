import { useEffect, useRef, useState } from 'react'
import { ArticlePreview, type Article } from '../../../components/article-preview'
import { EmptyState } from '../../../primitives/empty-state'
import { Skeleton } from '../../../primitives/skeleton'

type ArticleOriginalProps = {
  /** Where the article is served as JSON, in the library's `Article` shape. */
  url: string
  zoom: number
  onLoad: (info: { pageCount?: number }) => void
  onError: () => void
}

type Loaded = { url: string; article: Article | null }

/**
 * The reference panel's Original view for a knowledge article. ArticlePreview
 * takes data and fetches nothing, so the fetching is here, in the app: an app
 * would ask its own backend, which holds the service account that reads the
 * knowledge base.
 *
 * ArticlePreview is experimental, and so is this: it shows the wiring, on the
 * sample article, and is not yet how an app is known to do it.
 */
export function ArticleOriginal({ url, zoom, onLoad, onError }: ArticleOriginalProps) {
  // The answer is kept with the address it came from, so a new address starts
  // out loading without an effect to reset it. A null article is a failure.
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  // The panel hands over fresh handlers on every render. Read through a ref,
  // they can change without the article being fetched again.
  const host = useRef({ onLoad, onError })
  useEffect(() => {
    host.current = { onLoad, onError }
  })

  useEffect(() => {
    const abort = new AbortController()
    fetch(url, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
        return response.json() as Promise<Article>
      })
      .then((article) => {
        setLoaded({ url, article })
        // No page count: an article is one sheet.
        host.current.onLoad({})
      })
      .catch(() => {
        if (abort.signal.aborted) return
        setLoaded({ url, article: null })
        host.current.onError()
      })
    return () => abort.abort()
  }, [url])

  const current = loaded?.url === url ? loaded : null

  if (!current)
    return (
      <div role="status" className="flex flex-col gap-3 p-6">
        <span className="sr-only">Loading the article</span>
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-3" />
        <Skeleton className="h-3" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    )

  if (!current.article)
    return (
      <EmptyState
        role="alert"
        title="Can’t show this article here"
        body="The article didn’t load. The excerpt is still available."
        className="m-auto flex max-w-xs flex-col gap-1 px-6 py-10 text-center"
        titleClassName="text-[15px] font-semibold text-ink-strong"
        bodyClassName="text-[13px] leading-relaxed text-ink-soft"
      />
    )

  return <ArticlePreview article={current.article} zoom={zoom} />
}
