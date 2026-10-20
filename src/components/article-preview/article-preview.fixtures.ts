import type { SalesforceArticleDetail } from './salesforce'
import type { Article } from './types'

// A small picture inlined as a data URL, so the fixture needs no network.
const DIAGRAM =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="84" font-family="Arial" font-size="13">' +
      '<rect x="1" y="22" width="100" height="40" rx="6" fill="#eef3fe" stroke="#2f6fed"/><text x="51" y="47" text-anchor="middle" fill="#2f6fed">Initiator</text>' +
      '<rect x="130" y="22" width="100" height="40" rx="6" fill="#eef3fe" stroke="#2f6fed"/><text x="180" y="47" text-anchor="middle" fill="#2f6fed">Approver</text>' +
      '<rect x="259" y="22" width="100" height="40" rx="6" fill="#2f6fed"/><text x="309" y="47" text-anchor="middle" fill="#fff">Bank</text>' +
      '<path d="M103 42h23m-6-5 6 5-6 5M232 42h23m-6-5 6 5-6 5" fill="none" stroke="#52606d" stroke-width="1.5"/></svg>',
  )

/** An article with one field of every kind, rich text included. */
export const article: Article = {
  title: 'Same-day wire transfers: cut-off times and approvals',
  summary:
    'When a wire has to be submitted to settle the same day, who has to approve it, and what happens to one that misses the window.',
  number: '000001004',
  type: 'How-to',
  version: 7,
  publishedAt: '2026-06-21T21:11:02Z',
  fields: [
    { name: 'Product__c', label: 'Product', kind: 'text', value: 'Treasury — Wires' },
    { name: 'Audience__c', label: 'Audience', kind: 'text', value: 'Internal' },
    { name: 'Validated__c', label: 'Validated', kind: 'boolean', value: 'true' },
    { name: 'Review_Date__c', label: 'Next review', kind: 'date', value: '2026-12-01' },
    {
      name: 'Question__c',
      label: 'Question',
      kind: 'text',
      value:
        'A client asks at 3:40 PM whether a $400,000 domestic wire can still go out today. What do I tell them, and what has to happen before the cut-off?',
    },
    {
      name: 'Answer__c',
      label: 'Answer',
      kind: 'richText',
      value: `<p>Yes, if it is <b>fully approved by 4:00 PM ET</b>. A wire over $250,000 needs two approvers from different teams, so start the second approval now.</p>
<h3>Cut-off times</h3>
<table>
  <thead><tr><th>Wire type</th><th>Submit by</th><th>Approvers</th></tr></thead>
  <tbody>
    <tr><td>Domestic, up to $250,000</td><td>4:30 PM ET</td><td>1</td></tr>
    <tr><td>Domestic, over $250,000</td><td>4:00 PM ET</td><td>2</td></tr>
    <tr><td>International</td><td>2:00 PM ET</td><td>2</td></tr>
  </tbody>
</table>
<h3>Before you promise same-day</h3>
<ol>
  <li>Confirm the beneficiary details against the callback log.</li>
  <li>Check that both approvers are <i>available</i>, not just assigned.</li>
  <li>Tell the client the cut-off in <u>their</u> time zone.</li>
</ol>
<p><img alt="A wire goes from the initiator to an approver, then to the bank." src="${DIAGRAM}"></p>
<p><span style="color: rgb(194, 57, 52);"><b>Missed the window?</b></span> The wire is queued for the next business day. It is not cancelled, and the client is not charged twice.</p>
<p>The full policy is in the <a href="https://library.example.com/policies/wires">wire approval runbook</a>.</p>`,
    },
    {
      name: 'Policy_Link__c',
      label: 'Policy',
      kind: 'link',
      value: 'https://library.example.com/policies/wires',
    },
    {
      name: 'Last_Verified__c',
      label: 'Last verified',
      kind: 'dateTime',
      value: '2026-06-18T14:30:00Z',
    },
    { name: 'Internal_Notes__c', label: 'Internal notes', kind: 'text', value: null },
  ],
}

/** The same article with every `kind` taken off, as a backend that doesn't know them would send it. */
export const untypedArticle: Article = {
  ...article,
  fields: article.fields.map(({ kind: _kind, ...field }) => field),
}

/** Nothing but a title: an article whose layout shows no fields. */
export const bareArticle: Article = { title: 'Holiday processing schedule', fields: [] }

/** Rich text that tries everything the sanitiser exists to stop. */
export const hostileArticle: Article = {
  title: 'Rich text is sanitised',
  summary: 'Every line below tried something. What is left is what is safe to show.',
  fields: [
    {
      name: 'Body__c',
      label: 'Body',
      kind: 'richText',
      value: `<p>This paragraph is fine.</p>
<script>window.__articleScriptRan = true</script>
<style>body { display: none }</style>
<p><img alt="A picture that fails to load" src="/docs/no-such-picture.png" onerror="window.__articleHandlerRan = true"></p>
<p><a href="javascript:window.__articleLinkRan = true">A link that ran script</a> and <a href="https://example.com/safe">a link that is safe</a>.</p>
<iframe src="https://example.com/embedded" title="Embedded page"></iframe>
<form action="https://example.com/collect"><input name="password" placeholder="Password"><button>Sign in</button></form>
<div style="position: fixed; inset: 0; background: rgba(200, 0, 0, 0.6);">An overlay that tried to cover the page.</div>`,
    },
    { name: 'Link__c', label: 'Link field', kind: 'link', value: 'javascript:alert(1)' },
  ],
}

/**
 * A response in the shape Salesforce documents for
 * `GET /services/data/vXX.X/support/knowledgeArticles/{id}`. The first five
 * layout items are the documentation's own example; the rest are the fields an
 * article usually has, whose `type` names Salesforce doesn't publish — these
 * are a guess, which is the point: the preview has to cope with not knowing.
 */
export const salesforceDetail: SalesforceArticleDetail = {
  title: 'Same-day wire transfers: cut-off times and approvals',
  summary: 'When a wire has to be submitted to settle the same day, and who approves it.',
  articleNumber: '000001004',
  versionNumber: 7,
  lastPublishedDate: '2016-06-21T21:11:02Z',
  layoutItems: [
    { label: 'Out of Date', name: 'IsOutOfDate', type: 'CHECKBOX', value: 'false' },
    { label: 'sample', name: 'sample', type: 'PICK_LIST', value: null },
    { label: 'Language', name: 'Language', type: 'PICK_LIST', value: 'en_US' },
    { label: 'MyNumber', name: 'MyNumber', type: 'NUMBER', value: null },
    { label: 'My File', name: 'My_File', type: 'FILE', value: null },
    { label: 'Title', name: 'Title', type: 'TEXT', value: 'Same-day wire transfers' },
    { label: 'Next review', name: 'Review_Date__c', type: 'DATE', value: '2026-12-01' },
    {
      label: 'Answer',
      name: 'Answer__c',
      type: 'SOME_TYPE_NOBODY_PLANNED_FOR',
      value:
        '<p>Yes, if it is <b>fully approved by 4:00 PM ET</b>.</p><ul><li>Over $250,000: two approvers.</li><li>International: submit by 2:00 PM ET.</li></ul>',
    },
  ],
}
