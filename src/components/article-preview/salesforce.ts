import type { Article, ArticleField, ArticleFieldKind } from './types'

/**
 * The parts of a Salesforce Knowledge article this reads, as the Support
 * Knowledge REST API returns them from
 * `GET /services/data/vXX.X/support/knowledgeArticles/{id}`.
 */
export type SalesforceArticleDetail = {
  title: string
  summary?: string | null
  articleNumber?: string
  versionNumber?: number
  lastPublishedDate?: string
  /** The fields the article's layout shows, in the layout's order. */
  layoutItems?: {
    /** Salesforce's name for the field's type — "CHECKBOX", "PICK_LIST". */
    type: string
    name: string
    label: string
    value: string | null
  }[]
}

// The title and summary head the article already.
const IN_THE_HEADER = new Set(['Title', 'Summary'])

// Salesforce documents the response's shape but not the list of `type` values,
// so only the ones certain of are named. A type missing from here is left
// without a kind, and the preview reads the value for what it is — which is
// how a rich text field is drawn as one whatever its type turns out to be.
function kindOf(type: string, value: string | null): ArticleFieldKind | undefined {
  if (type === 'CHECKBOX') return 'boolean'
  if (type.includes('DATE')) return value?.includes('T') ? 'dateTime' : 'date'
  return undefined
}

/**
 * Experimental, and more so than the component: this is written from
 * Salesforce's documentation and has never been run against a response from a
 * real org. Expect to correct it — the `type` names above all — the first
 * time it is.
 *
 * A Salesforce Knowledge article in the preview's shape. File fields are left
 * out: the API returns no value for them. `type` is left unset — Salesforce
 * sends the object's API name ("Knowledge__kav"), which is no label for a
 * reader; set it from the record type if there is one worth showing.
 *
 * Images in rich text still point at Salesforce and need its session to load.
 * Fetch them server-side (`…/richTextImageFields/{field}/{refid}`) and rewrite
 * each `src` before sending the article to a browser.
 */
export function articleFromSalesforce(detail: SalesforceArticleDetail): Article {
  const fields: ArticleField[] = (detail.layoutItems ?? [])
    .filter((item) => item.type !== 'FILE' && !IN_THE_HEADER.has(item.name))
    .map(({ type, name, label, value }) => ({ name, label, value, kind: kindOf(type, value) }))
  return {
    title: detail.title,
    summary: detail.summary ?? undefined,
    number: detail.articleNumber,
    version: detail.versionNumber,
    publishedAt: detail.lastPublishedDate,
    fields,
  }
}
