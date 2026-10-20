/**
 * The demo's conversation history — one list, three surfaces.
 *
 * The centred page's cards, the sidebar rail and the widget's Recent chats
 * panel all read from here. They used to carry three separate copies, which
 * meant a demo rehearsal could show one set of topics on the landing page and
 * a different set in the rail.
 *
 * The topics deliberately mix retail banking and treasury management: the same
 * assistant serves a branch customer asking about a rate lock and a corporate
 * treasurer chasing a positive-pay exception, and showing both in one history
 * is the fastest way to say so in a demo.
 *
 * Newest first. Ages are stored as `daysAgo` rather than as literal dates so
 * the history never goes stale between rehearsal and demo day — a hardcoded
 * "12 July" reads as a dead fixture the moment someone looks at it in
 * September.
 */
type RecentChatSeed = {
  id: string
  title: string
  /** Opening line of the answer, as the cards preview it. */
  snippet: string
  daysAgo: number
}

const seeds: RecentChatSeed[] = [
  {
    id: 'positive-pay',
    title: 'Positive pay exceptions',
    snippet:
      'Three exceptions are waiting on a pay/return decision, and the cutoff for today is 14:00 ET…',
    daysAgo: 2,
  },
  {
    id: 'rate-lock',
    title: 'Mortgage rate lock timing',
    snippet:
      'A 60-day lock covers a normal closing with room to spare; the float-down is only worth it if…',
    daysAgo: 3,
  },
  {
    id: 'lockbox',
    title: 'Lockbox remittance matching',
    snippet:
      'Most unmatched items here are short-pays against a single invoice rather than true exceptions…',
    daysAgo: 5,
  },
  {
    id: 'sweep',
    title: 'Sweep account thresholds',
    snippet:
      'Raising the target balance would have left $1.2M idle last month, against roughly $3,400 in…',
    daysAgo: 8,
  },
  {
    id: 'overdraft',
    title: 'Overdraft protection options',
    snippet:
      'Linking the savings account covers the gap without a fee; the line of credit only makes sense…',
    daysAgo: 13,
  },
  {
    id: 'wire-cutoffs',
    title: 'Wire cutoff times by currency',
    snippet:
      'USD runs to 17:00 ET, but EUR and GBP close earlier because the value date follows the local…',
    daysAgo: 20,
  },
  {
    id: 'account-analysis',
    title: 'Reading the account analysis statement',
    snippet:
      'The earnings credit offsets service charges before they are billed, so the net line is what…',
    daysAgo: 27,
  },
]

/** Short relative age for the sidebar rail, which is too narrow for a date. */
function shortAge(daysAgo: number): string {
  if (daysAgo < 7) return `${daysAgo}d`
  return `${Math.round(daysAgo / 7)}w`
}

/** Full date for the roomier cards on the centred page. */
function dateLabel(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export type DemoRecentChat = {
  id: string
  title: string
  snippet: string
  /** e.g. `2d`, `3w` */
  when: string
  /** e.g. `18 Sept` */
  date: string
}

export const recentChats: DemoRecentChat[] = seeds.map((s) => ({
  id: s.id,
  title: s.title,
  snippet: s.snippet,
  when: shortAge(s.daysAgo),
  date: dateLabel(s.daysAgo),
}))
