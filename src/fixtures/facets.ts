// A facet index for the FacetFilters stories — a trimmed port of the chat
// demo's facet mocks. One coherent corpus, so the counts agree
// with each other: every facet is an attribute of a loan, and "items in scope"
// is the sum of each matching loan's document count. Loan Number is the
// high-cardinality group (one value per loan) that forces lookup mode.
import { FACET_NULL_VALUE } from '../components/facet-filters'
import type {
  FacetGroup,
  FacetQuery,
  FacetSelection,
  FacetValue,
} from '../components/facet-filters'

export const LOAN_COUNT = 4200

const ACCOUNTS: [string, string][] = [
  ['chk', 'Everyday Checking'],
  ['ops', 'Operating — Alderfinch'],
  ['sav', 'High-Yield Savings'],
  ['pay', 'Payroll'],
  ['card', 'Corporate Card'],
  ['mm', 'Money Market'],
]

const CATEGORIES: [string, string][] = [
  ['gro', 'Groceries'],
  ['din', 'Dining out'],
  ['trv', 'Travel'],
  ['utl', 'Utilities'],
  ['sof', 'Software'],
  ['ins', 'Insurance'],
  ['fee', 'Wire fees'],
  ['pyr', 'Payroll'],
]

const DOC_TYPES: [string, string][] = [
  ['txn', 'Transaction'],
  ['stm', 'Statement'],
  ['inv', 'Invoice'],
  ['wir', 'Wire advice'],
]

export const DATE_RANGES = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Year to date' },
]

export const FACET_TYPES = ['Merchant', 'Tag', 'Reference #', 'Amount over']

const TYPE_HINTS: Record<string, { placeholder: string; hint: string }> = {
  Merchant: {
    placeholder: 'Delta Air Lines',
    hint: 'Matches the merchant string on each transaction.',
  },
  Tag: { placeholder: 'q3-offsite', hint: 'Tags applied in the ledger.' },
  'Reference #': { placeholder: 'WF-88213', hint: 'Wire, check or ACH reference.' },
  'Amount over': { placeholder: '500', hint: 'USD, applied to the absolute value.' },
}

export function describeFacetType(type: string) {
  return TYPE_HINTS[type] ?? {}
}

type Loan = {
  id: string
  account: string
  category: string
  docType: string
  daysAgo: number
  items: number
}

/** Deterministic, so every story run tells the same story. */
function lcg(seed: number) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

const loans: Loan[] = (() => {
  const random = lcg(LOAN_COUNT)
  const out: Loan[] = []
  for (let i = 0; i < LOAN_COUNT; i += 1) {
    const id = String(100000000 + ((i * 7919) % 89999999))
    // A handful carry no account — why the group is nullable.
    const account =
      random() < 0.01 ? FACET_NULL_VALUE : ACCOUNTS[Math.floor(random() * ACCOUNTS.length)][0]
    const category = CATEGORIES[Math.floor(random() * CATEGORIES.length)][0]
    const docType = DOC_TYPES[Math.floor(random() * DOC_TYPES.length)][0]
    // Corporate Card is all historical, so "Last 30 days" greys it out.
    const daysAgo =
      account === 'card'
        ? 120 + Math.floor(random() * 200)
        : [3, 12, 45, 200][Math.floor(random() * 4)]
    out.push({ id, account, category, docType, daysAgo, items: 1 + Math.floor(random() * 9) })
  }
  return out
})()

type Criteria = { selection: FacetSelection; days: number; queries: FacetQuery[] }

/** Standard faceted semantics: a group's own counts ignore its own picks. */
function matches(loan: Loan, { selection, days, queries }: Criteria, skip: string | null): boolean {
  if (loan.daysAgo > days) return false
  const pick = (key: string, value: string) =>
    skip === key || !selection[key]?.length || selection[key].includes(value)
  if (
    !pick('accounts', loan.account) ||
    !pick('categories', loan.category) ||
    !pick('docType', loan.docType)
  )
    return false
  if (skip !== 'loans') {
    const picked = selection.loans ?? []
    const loanQueries = queries.filter((q) => q.groupKey === 'loans')
    if (picked.length || loanQueries.length) {
      if (!picked.includes(loan.id) && !loanQueries.some((q) => loan.id.includes(q.query)))
        return false
    }
  }
  return true
}

function bucket(
  c: Criteria,
  key: string,
  field: keyof Loan,
  options: [string, string][],
  nullable = false,
) {
  const totals = new Map<string, number>()
  for (const loan of loans) {
    if (!matches(loan, c, key)) continue
    const v = String(loan[field])
    totals.set(v, (totals.get(v) ?? 0) + loan.items)
  }
  const values: FacetValue[] = options.map(([value, label]) => ({
    value,
    label,
    count: totals.get(value) ?? 0,
  }))
  if (nullable)
    values.push({
      value: FACET_NULL_VALUE,
      label: 'No account',
      count: totals.get(FACET_NULL_VALUE) ?? 0,
    })
  return values
}

/** Stands in for `POST /facets`. */
export function queryFacets(selection: FacetSelection, days: number, queries: FacetQuery[] = []) {
  const c: Criteria = { selection, days, queries }
  let total = 0
  for (const loan of loans) if (matches(loan, c, null)) total += loan.items
  const groups: FacetGroup[] = [
    {
      key: 'accounts',
      label: 'Accounts',
      values: bucket(c, 'accounts', 'account', ACCOUNTS, true),
      cardinality: 7,
      nullable: true,
    },
    {
      key: 'categories',
      label: 'Categories',
      values: bucket(c, 'categories', 'category', CATEGORIES),
      cardinality: 8,
    },
    {
      key: 'docType',
      label: 'Document type',
      values: bucket(c, 'docType', 'docType', DOC_TYPES),
      cardinality: 4,
    },
  ]
  return { total, groups }
}

/** Stands in for `POST /facets/loans/search` — a page of matches plus totals. */
export function searchLoans(
  selection: FacetSelection,
  days: number,
  query: string,
  limit: number,
  queries: FacetQuery[] = [],
) {
  const c: Criteria = { selection, days, queries }
  const q = query.trim()
  const hits = loans.filter((loan) => (!q || loan.id.includes(q)) && matches(loan, c, 'loans'))
  const page = hits.slice(0, limit)
  // Picks travel with the page, or a virtualised row would drop them.
  const seen = new Set(page.map((l) => l.id))
  const picked = loans.filter((l) => selection.loans?.includes(l.id) && !seen.has(l.id))
  return {
    values: [...picked, ...page].map((l) => ({ value: l.id, count: l.items })),
    loaded: page.length,
    matchCount: hits.length,
    hasMore: hits.length > page.length,
  }
}
