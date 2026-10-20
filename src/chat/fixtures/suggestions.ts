import type { Suggestion } from '../engine/types'

/**
 * Today's suggested questions for the tenant. A real deployment fetches these
 * each morning — the top questions across the organization — and hands them
 * to the composer; the reasons say why each one made the list.
 */
export const todaysSuggestions: Suggestion[] = [
  { text: 'What changed in our cash position since Friday?', reason: 'Monday check-in' },
  { text: 'Which invoices are due this week?', reason: 'Popular in your org' },
  { text: 'Summarize policy updates from the last 7 days', reason: 'New this week' },
  { text: 'Show accounts with unusual activity today', reason: 'Trending today' },
  { text: 'Draft a status note for the treasury team', reason: 'Your routine' },
]

/** More of what the organization asks often — suggest-as-you-type matches
 *  these too, after today's list. */
export const typeaheadPool: Suggestion[] = [
  { text: 'Draw the wire transfer approval flow as a diagram', reason: 'New this week' },
  { text: 'Which investment accounts changed most since Friday?', reason: 'Asked before' },
  { text: 'Which internal policies were updated this month?', reason: 'New this week' },
  { text: 'Summarize open approvals waiting on me', reason: 'Asked before' },
  { text: 'Show wires sent yesterday', reason: 'Popular in your org' },
  { text: 'Draft a reply to the audit request', reason: 'Trending today' },
  { text: 'Compare this month’s operating expenses with last month', reason: 'Asked before' },
]
