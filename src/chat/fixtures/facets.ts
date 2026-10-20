// The demo's facet index — one coherent corpus rather than four unrelated
// fixtures, so the counts actually agree with each other.
//
// The corpus is 20,412 loans. Every other facet is an attribute of a loan, and
// "items in scope" is the sum of each matching loan's document count. That
// shape is deliberate: it is what makes Loan Number a genuine high-cardinality
// group (one value per loan) while Accounts stays at six, which is the whole
// reason the rail needs two different controls.
import {
  FACET_NULL_VALUE,
  type CustomFacet,
  type FacetGroup,
  type FacetQuery,
  type FacetSelection,
  type FacetValue,
} from '../../components/facet-filters'
import type { AskedOverChip } from '../engine/types'

export const LOAN_COUNT = 20412

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
  ['ppe', 'Positive-pay exception'],
]

export const DATE_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Year to date' },
]

export const FACET_TYPES = [
  'Merchant',
  'Account',
  'Category',
  'Tag',
  'Reference #',
  'Amount over',
  'Date on/after',
]

const TYPE_HINTS: Record<string, { placeholder: string; hint: string }> = {
  Merchant: {
    placeholder: 'Delta Air Lines',
    hint: 'Matches the merchant string on each transaction.',
  },
  Account: { placeholder: 'Operating — Alderfinch', hint: 'Nickname or last four digits.' },
  Category: { placeholder: 'Travel', hint: 'One of your categories, or a bank-assigned one.' },
  Tag: { placeholder: 'q3-offsite', hint: 'Tags applied in the ledger.' },
  'Reference #': { placeholder: 'WF-88213', hint: 'Wire, check or ACH reference.' },
  'Amount over': { placeholder: '500', hint: 'USD, applied to the absolute value.' },
  'Date on/after': { placeholder: '2026-08-01', hint: 'ISO date. Overrides the range above.' },
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

/** Deterministic, so the demo tells the same story at every rehearsal. */
function lcg(seed: number) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

function buildLoans(): Loan[] {
  const random = lcg(20412)
  const out: Loan[] = []
  for (let i = 0; i < LOAN_COUNT; i += 1) {
    // Unique nine-digit identifiers: 7919 is coprime with the modulus, so the
    // sequence never repeats over the range we take from it.
    const id = String(100000000 + ((i * 7919) % 89999999))
    const accountRoll = random()
    // A handful of loans carry no account at all. They are the reason the
    // group is nullable, and the reason "all six ticked" is not the same
    // filter as "group cleared".
    const account =
      accountRoll < 0.002 ? FACET_NULL_VALUE : ACCOUNTS[Math.floor(random() * ACCOUNTS.length)][0]
    const category = CATEGORIES[Math.floor(random() * CATEGORIES.length)][0]
    const docType = DOC_TYPES[Math.floor(random() * DOC_TYPES.length)][0]
    // Corporate Card is deliberately all historical, so narrowing to the last
    // 30 days drives it to zero and shows the greyed-out state on first run.
    const daysAgo =
      account === 'card'
        ? 90 + Math.floor(random() * 270)
        : [3, 12, 45, 200][Math.floor(random() * 4)]
    out.push({ id, account, category, docType, daysAgo, items: 1 + Math.floor(random() * 9) })
  }
  // A known number to search for, so the exact-match path has something to hit.
  out[3000] = {
    ...out[3000],
    id: '177223273',
    account: 'ops',
    category: 'trv',
    daysAgo: 12,
    items: 18,
  }
  return out
}

export const loans = buildLoans()

const loanIndex = new Map(loans.map((loan) => [loan.id, loan]))

type Criteria = { selection: FacetSelection; days: number; queries: FacetQuery[] }

/** Standard faceted semantics: a group's own counts ignore its own picks. */
function matches(loan: Loan, { selection, days, queries }: Criteria, skip: string | null): boolean {
  if (loan.daysAgo > days) return false
  if (
    skip !== 'accounts' &&
    selection.accounts?.length &&
    !selection.accounts.includes(loan.account)
  )
    return false
  if (
    skip !== 'categories' &&
    selection.categories?.length &&
    !selection.categories.includes(loan.category)
  )
    return false
  if (skip !== 'docType' && selection.docType?.length && !selection.docType.includes(loan.docType))
    return false

  // Picked values and query chips are the same group, so they OR together the
  // way two ticked checkboxes would: "these four loans, or anything containing
  // 1772". Re-evaluated on every call, which is the point of keeping the
  // predicate rather than the 4,108 ids it matched when it was created.
  if (skip !== 'loans') {
    const picked = selection.loans ?? []
    const loanQueries = queries.filter((query) => query.groupKey === 'loans')
    if (picked.length > 0 || loanQueries.length > 0) {
      const hit =
        picked.includes(loan.id) || loanQueries.some((query) => loan.id.includes(query.query))
      if (!hit) return false
    }
  }
  return true
}

function bucket(
  criteria: Criteria,
  key: string,
  field: keyof Loan,
  options: [string, string][],
  nullable = false,
): FacetValue[] {
  const totals = new Map<string, number>()
  for (const loan of loans) {
    if (!matches(loan, criteria, key)) continue
    const value = String(loan[field])
    totals.set(value, (totals.get(value) ?? 0) + loan.items)
  }
  const values = options.map(([value, label]) => ({
    value,
    label,
    count: totals.get(value) ?? 0,
  }))
  if (nullable) {
    values.push({
      value: FACET_NULL_VALUE,
      label: 'No account',
      count: totals.get(FACET_NULL_VALUE) ?? 0,
    })
  }
  return values
}

export type FacetSnapshot = { total: number; groups: FacetGroup[] }

/** Stands in for `POST /facets` — every list group's counts in one pass set. */
export function queryFacets(
  selection: FacetSelection,
  days: number,
  queries: FacetQuery[] = [],
): FacetSnapshot {
  const criteria: Criteria = { selection, days, queries }
  let total = 0
  for (const loan of loans) if (matches(loan, criteria, null)) total += loan.items

  return {
    total,
    groups: [
      {
        key: 'accounts',
        label: 'Accounts',
        values: bucket(criteria, 'accounts', 'account', ACCOUNTS, true),
        cardinality: ACCOUNTS.length + 1,
        nullable: true,
      },
      {
        key: 'categories',
        label: 'Categories',
        values: bucket(criteria, 'categories', 'category', CATEGORIES),
        cardinality: CATEGORIES.length,
      },
      {
        key: 'docType',
        label: 'Document type',
        values: bucket(criteria, 'docType', 'docType', DOC_TYPES),
        cardinality: DOC_TYPES.length,
      },
    ],
  }
}

/**
 * Stands in for `POST /facets/loans/search` — prefix-ish matching, counts for
 * the page only, and a cursor in the shape of a limit. The real endpoint would
 * page on an opaque cursor; the shape the UI consumes is the same.
 */
export function searchLoans(
  selection: FacetSelection,
  days: number,
  query: string,
  limit: number,
  queries: FacetQuery[] = [],
): { values: FacetValue[]; loaded: number; matchCount: number; hasMore: boolean } {
  const criteria: Criteria = { selection, days, queries }
  const q = query.trim()
  const hits: Loan[] = []
  for (const loan of loans) {
    if (q && !loan.id.includes(q)) continue
    if (!matches(loan, criteria, 'loans')) continue
    hits.push(loan)
  }
  hits.sort((a, b) => (q ? a.id.indexOf(q) - b.id.indexOf(q) : 0) || b.items - a.items)

  // Picked values always travel with the page: a virtualized row unmounts when
  // it scrolls away, so a selection that lived only in the window would vanish
  // from the UI while staying in the query.
  const picked = (selection.loans ?? [])
    .map((id) => loanIndex.get(id))
    .filter((loan): loan is Loan => Boolean(loan))

  const page = hits.slice(0, limit)
  const seen = new Set(page.map((loan) => loan.id))
  const values = [...picked.filter((loan) => !seen.has(loan.id)), ...page].map((loan) => ({
    value: loan.id,
    count: loan.items,
  }))

  // `loaded` counts the page, not the pinned picks travelling with it — the
  // load controls offer "matchCount - loaded", and picks are not a page.
  return {
    values,
    loaded: page.length,
    matchCount: hits.length,
    hasMore: hits.length > page.length,
  }
}

const GROUP_LABELS: Record<string, string> = {
  accounts: 'Accounts',
  categories: 'Categories',
  docType: 'Document type',
  loans: 'Loan Number',
}

const VALUE_LABELS: Record<string, Record<string, string>> = {
  accounts: Object.fromEntries([...ACCOUNTS, [FACET_NULL_VALUE, 'No account']]),
  categories: Object.fromEntries(CATEGORIES),
  docType: Object.fromEntries(DOC_TYPES),
  loans: {},
}

/**
 * The filters in force, as the chips a question records.
 *
 * Label lookup only — no counting, so the transcript can ask "has the scope
 * changed?" on every render without walking twenty thousand loans to find
 * out. The total is added at capture time, where paying for it once is fine.
 *
 * The date range is included when anything else is set, but never counts
 * toward "did they filter": a default range is the absence of a decision, and
 * a strip on every single message stops being read by the third one.
 */
export function describeScope(
  selection: FacetSelection,
  days: string,
  queries: FacetQuery[],
  customFacets: CustomFacet[],
): AskedOverChip[] {
  const facets: AskedOverChip[] = []

  for (const [groupKey, values] of Object.entries(selection)) {
    for (const value of values) {
      facets.push({
        kind: 'facet',
        prefix: GROUP_LABELS[groupKey] ?? groupKey,
        label: VALUE_LABELS[groupKey]?.[value] ?? value,
        ref: { group: groupKey, value },
      })
    }
  }

  for (const query of queries) {
    facets.push({
      kind: 'query',
      prefix: `${GROUP_LABELS[query.groupKey] ?? query.groupKey} contains`,
      label: query.query,
      count: typeof query.count === 'number' ? query.count : undefined,
      ref: { group: query.groupKey, value: query.query },
    })
  }

  for (const facet of customFacets) {
    facets.push({ kind: 'custom', prefix: facet.type, label: facet.value })
  }

  if (facets.length === 0) return []

  const range = DATE_RANGES.find((option) => option.value === days)
  return range ? [{ kind: 'scope', label: range.label }, ...facets] : facets
}

/** The inverse, as far as it goes: which chips can be put back on the rail. */
export function resolveScope(chips: AskedOverChip[]): {
  selection: FacetSelection
  queries: FacetQuery[]
  customFacets: { type: string; value: string }[]
  days?: string
  missing: string[]
} {
  const selection: FacetSelection = {}
  const queries: FacetQuery[] = []
  const customFacets: { type: string; value: string }[] = []
  const missing: string[] = []
  let days: string | undefined

  for (const chip of chips) {
    if (chip.kind === 'scope') {
      days = DATE_RANGES.find((option) => option.label === chip.label)?.value
      continue
    }
    if (chip.kind === 'custom') {
      customFacets.push({ type: chip.prefix ?? 'Tag', value: chip.label })
      continue
    }
    if (!chip.ref) {
      missing.push(chip.label)
      continue
    }
    if (chip.kind === 'query') {
      queries.push({ groupKey: chip.ref.group, query: chip.ref.value, count: chip.count })
      continue
    }
    // A value the index no longer offers cannot be re-selected, and restoring
    // it silently would produce a scope that matches nothing.
    const known = chip.ref.group === 'loans' || VALUE_LABELS[chip.ref.group]?.[chip.ref.value]
    if (!known) {
      missing.push(chip.label)
      continue
    }
    selection[chip.ref.group] = [...(selection[chip.ref.group] ?? []), chip.ref.value]
  }

  return { selection, queries, customFacets, days, missing }
}
