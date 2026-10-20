/**
 * How a field's value is drawn. `text` keeps line breaks; `richText` is HTML,
 * sanitised before it is shown; `boolean` reads the string `"true"`; `date`
 * and `dateTime` read ISO 8601; `link` is a URL.
 */
export type ArticleFieldKind = 'text' | 'richText' | 'boolean' | 'date' | 'dateTime' | 'link'

/** One labelled value of an article, in the order the article's layout puts it. */
export type ArticleField = {
  /** The field's API name. Identifies it; never shown. */
  name: string
  label: string
  /**
   * Left out — or a kind this version doesn't know — the value is read for
   * what it is: HTML is drawn as rich text, a lone URL as a link, anything
   * else as text. So a field type nobody planned for still shows.
   */
  kind?: ArticleFieldKind
  /** Always a string, as the source system sends it. Null or empty is an unset field. */
  value: string | null
}

/**
 * A knowledge article as data: what a backend sends once it has fetched the
 * article and put it in this shape. Nothing here is specific to one system —
 * `articleFromSalesforce` maps a Salesforce Knowledge response onto it.
 *
 * Experimental, with ArticlePreview: fields and kinds may be added, renamed or
 * regrouped once real articles show what the shape is missing.
 */
export type Article = {
  title: string
  summary?: string
  /** The article's number as the source system shows it — "000001004". */
  number?: string
  /** The kind of article — "FAQ", "How-to". */
  type?: string
  version?: number
  /** ISO 8601. */
  publishedAt?: string
  fields: ArticleField[]
}

export type ArticlePreviewLabels = {
  region: (title: string) => string
  number: (number: string) => string
  version: (version: number) => string
  published: (date: string) => string
  yes: string
  no: string
  /** Stands in for an unset field when `showEmpty` is on. */
  empty: string
}

/** Experimental — see ArticlePreview. These props may change without a deprecation step. */
export type ArticlePreviewProps = {
  /** The article to draw. Fetching it is the host's: this takes data, not a URL. */
  article: Article
  /** 1 is reading size. Text scales and the sheet reflows around it. */
  zoom?: number
  /** Show fields that have no value, as a dash. Off, they are left out. */
  showEmpty?: boolean
  /**
   * Writes a date for the reader. Gets the ISO string and whether it carries a
   * time. Defaults to the browser's locale, medium length.
   */
  formatDate?: (value: string, kind: 'date' | 'dateTime') => string
  labels?: Partial<ArticlePreviewLabels>
  className?: string
}
