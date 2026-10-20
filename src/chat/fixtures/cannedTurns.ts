// Canned assistant turns for the design mockup — cycled in order.
// Inline [n] markers in content refer to the turn's `sources` by id.
import { type CannedTurn } from '../engine/chatEngine'
import { sourceHighlights } from '../engine/highlights'
import { type Source } from '../engine/types'

// Stress-test corpus: many small generated docs to exercise the reference
// rail at scale (x-scroll, auto-scroll-into-view, prev/next across 50).
const stressTopics = [
  'Savings Rates',
  'Account Fees',
  'Budget Ratios',
  'Card Rewards',
  'Loan Terms',
  'Tax Brackets',
  'Insurance Riders',
  'Index Funds',
  'Cash Flow',
  'Credit Scores',
]

function makeStressSources(count: number): Source[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1
    const topic = stressTopics[i % stressTopics.length]
    const flavor = id % 3
    const body =
      flavor === 0
        ? `### Key figures

| Metric | Value | Percentile |
| :--- | ---: | ---: |
| Median | ${(2 + (id % 7) * 0.45).toFixed(2)}% | 50th |
| Upper band | ${(4 + (id % 5) * 0.6).toFixed(2)}% | 90th |
| Floor | ${(0.5 + (id % 3) * 0.25).toFixed(2)}% | 10th |

> Figures in doc ${id} are illustrative sample data for the ${topic.toLowerCase()} series.`
        : flavor === 1
          ? `### Checklist

1. Confirm the ${topic.toLowerCase()} assumptions against the latest statement.
2. Flag anything that moved more than **±${(id % 9) + 1}%** quarter over quarter.
3. Record exceptions in the shared tracker with code \`${topic.replace(/\s/g, '-').toUpperCase()}-${id}\`.

- Applies to statements after Q${(id % 4) + 1} 2025
- Review cadence: every ${(id % 3) + 1} month(s)`
          : `### Notes

This working note supports answer marker [${id}]. The ${topic.toLowerCase()} series is summarized as:

\`\`\`json
{ "doc": ${id}, "series": "${topic}", "window": "${(id % 12) + 1}mo", "confidence": ${(0.6 + (id % 4) * 0.1).toFixed(1)} }
\`\`\`

Cross-reference the adjacent docs for the surrounding ${topic.toLowerCase()} context.`
    return {
      id,
      title: `Doc ${id}: ${topic} Working Paper`,
      markdown: `## ${topic} — working paper ${id}\n\nOne of ${count} generated reference documents in the stress-test corpus.\n\n${body}`,
      url: `https://library.example.com/working-papers/doc-${id}.pdf`,
      fileType: 'PDF',
      pageCount: 3 + (id % 10),
      updatedLabel: `Q${(id % 4) + 1} 2026`,
    }
  })
}

/** The `fileType` of a source that is a knowledge article — a record, not a file. */
export const ARTICLE_FILE_TYPE = 'Knowledge article'

export const cannedTurns: CannedTurn[] = [
  {
    match: /50|stress|many ref|lots of ref/i,
    thinking:
      'The user wants to see how the reference UI behaves with a large corpus. I will cite documents scattered across the full range — low, middle, and high numbers — so jumping between distant references gets exercised.',
    content:
      'Here is a synthesis drawn from a **50-document corpus** — the point of this turn is navigation, so the citations jump around on purpose.\n\nThe headline series sits near its five-year median [3], though the fee data tells a different story [17]. Three things stand out:\n\n1. Rate dispersion is widest in the upper band [8], and the pattern repeats across the quarterly cuts [23].\n2. The checklist-style docs [11] and [29] both flag quarter-over-quarter moves that exceed their thresholds — compare them against the summary in [36].\n3. The tail of the corpus is where the caveats live: methodology notes [42], the confidence table [47], and the final reconciliation [50].\n\nJump between [3] and [50] to feel the navigation, or open any middle document like [23] and arrow through its neighbors.',
    sources: makeStressSources(50),
    followups: [
      'Summarize just the tail documents',
      'Which of these docs disagree with each other?',
      'Show me the methodology notes',
    ],
  },
  {
    thinking:
      'The user is asking a personal-finance question. I should ground the answer in their stated goal, keep the math simple, and end with one concrete next step rather than a wall of options.\nKey factors: monthly cash flow, timeline, and how liquid the money needs to stay.',
    content:
      'Here is a straightforward way to think about it.\n\nStart with your monthly surplus — income after fixed costs and typical spending. Whatever that number is, automating a transfer on payday matters more than the exact amount [3], because consistency beats optimization at this stage [1].\n\nA practical split many people use:\n\n1. Keep one month of expenses in checking as a buffer [1].\n2. Direct new savings to a high-yield account until you reach your target — rates vary widely between providers [2], so it pays to compare.\n3. Only after that, route the overflow toward investing or extra debt payments [5].\n\nMost people land on a three-to-six-month emergency fund [1], though gig and single-income households often stretch that further [4].\n\nIf you share your monthly surplus and target date, I can turn this into a specific schedule with milestones.',
    sources: [
      {
        id: 1,
        title: 'Emergency Fund Sizing Guidelines',
        markdown: `## How large should an emergency fund be?

The classic guidance is **three to six months of essential expenses**, but the right number depends on income stability, household structure, and insurance coverage.

### Sizing by situation

| Situation | Suggested months | Rationale |
| :--- | :---: | :--- |
| Dual income, stable jobs | **3** | Two paychecks cushion a single job loss |
| Single income, stable job | **4–5** | No second earner to absorb a gap |
| Variable / gig income | **6–9** | Income itself is the risk |
| Small-business owner | **9–12** | Personal and business risk are correlated |

> An emergency fund is insurance, not an investment. Judge it by how well it lets you sleep, not by its yield.

### What counts as "essential expenses"

- Housing (rent or mortgage, insurance, property tax)
- Utilities and groceries
- Insurance premiums and minimum debt payments
- Transportation to work

Discretionary spending — travel, dining out, subscriptions — is excluded, which is why the target is usually **60–75%** of normal monthly spending.`,
        // A real file, served from public/docs, so the panel's Original view
        // has something to draw. No pageCount: the file says how long it is.
        url: '/docs/sample.pdf',
        fileType: 'PDF',
        updatedLabel: 'Jan 2026',
      },
      {
        id: 2,
        title: 'High-Yield Savings Accounts: 2026 Rate Survey',
        markdown: `## 2026 rate survey

A comparison of widely available high-yield savings accounts as of Q2 2026. APYs move with the federal funds rate — treat these as a snapshot, not a promise.

| Provider | APY | Monthly fee | Minimum balance | FDIC insured | Transfer limit | Notes |
| :--- | ---: | ---: | ---: | :---: | :--- | :--- |
| Meridian Direct | **4.35%** | $0 | $0 | Yes | 6/month | Rate drops to 0.25% above \`$250k\` |
| Bluepeak Savings | 4.20% | $0 | $500 | Yes | Unlimited | $500 min to earn stated APY |
| Harborline Bank | 4.10% | $5 | $1,000 | Yes | 6/month | Fee waived with \`$2,500\` balance |
| Foxglove Financial | **4.50%** | $0 | $0 | Yes | 6/month | Promo rate, reverts after 6 months |
| Cornerstone Mutual | 3.85% | $0 | $100 | Yes | Unlimited | Slower ACH (2–3 business days) |
| Atlas Savings Co. | 4.25% | $0 | $0 | No* | Unlimited | *NCUA insured (credit union) |

### Reading the table

- **Promo rates** (like Foxglove's) are fine for parking cash short-term, but compare the *reversion* rate before committing.
- The federal **6 transfers/month** convention survives at many banks even though the underlying regulation was relaxed.
- Insurance cap is **$250,000 per depositor, per institution** — split larger balances across providers.`,
        url: 'https://rates.example.com/high-yield-savings-2026',
        fileType: 'Web page',
        updatedLabel: 'Apr 2026',
      },
      {
        id: 3,
        title: 'Why Automation Beats Willpower',
        markdown: `## The case for automatic transfers

Behavioral studies consistently find that *defaults dominate decisions*: money moved before it reaches the spending account gets saved at 2–3× the rate of money saved "when there's some left over."

### A minimal setup

\`\`\`text
payday (1st, 15th)
  ├─ 60%  → checking        (fixed costs + spending)
  ├─ 25%  → high-yield      (emergency fund, then goals)
  └─ 15%  → retirement      (401k / IRA, pre-tax first)
\`\`\`

1. Schedule the transfer for the **morning after payday** so it never competes with weekend spending.
2. Start smaller than feels ambitious — a transfer you never pause beats one you keep editing.
3. Increase the amount by 1% of income every quarter; the change is too small to feel.

> Consistency beats optimization: a mediocre plan you follow for ten years outperforms a perfect plan you abandon in March.`,
        url: '/docs/sample.docx',
        fileType: 'DOCX',
        updatedLabel: 'Nov 2025',
      },
      {
        id: 4,
        title: 'Income Volatility and Household Buffers',
        markdown: `## Buffers for variable income

Households with variable income face a different problem: the *average* month is fine, but the sequence of months is not. A buffer converts a volatile income stream into a steady personal "salary."

### The two-account pattern

- **Income account** — every payment lands here, nothing is spent from it.
- **Salary account** — a fixed monthly transfer from the income account funds all spending.

The buffer's job is to keep the salary transfer alive through lean months.

### Sizing the buffer

| Coefficient of variation* | Buffer target |
| :--- | ---: |
| Under 15% (mild swings) | 2 months of salary |
| 15–35% (freelance typical) | 4 months |
| Over 35% (seasonal, commission) | 6+ months |

*Standard deviation of monthly income ÷ average monthly income, over the trailing year.

**Bold move that pays off:** during a strong month, top the buffer *first* and only then raise your salary transfer.`,
        url: 'https://guides.example.com/income-volatility-buffers.pdf',
        fileType: 'PDF',
        pageCount: 5,
        updatedLabel: 'Feb 2026',
      },
      {
        id: 5,
        title: 'Ordering Savings, Debt, and Investing',
        markdown: `## Where the next dollar goes

A widely used priority order for each marginal dollar of surplus:

1. **Employer match** — contribute enough to capture any 401(k) match; it is an instant 50–100% return.
2. **High-interest debt** — anything above ~8% APR (credit cards first).
3. **Emergency fund** — to your target from the sizing guidelines.
4. **Tax-advantaged investing** — IRA / 401(k) beyond the match.
5. **Taxable investing or mortgage prepayment** — personal preference territory.

### Why debt sits above the fund's *completion* but below its *start*

Keep a small starter buffer (**$1,000–$2,000**) even while attacking debt — without it, every surprise expense goes straight back on the card, undoing the payoff.

> The order is a default, not a law. A guaranteed 22% return from paying off a credit card beats any savings account; the reverse is rarely true.`,
        // The third placeholder in public/docs: a deck, drawn slide by slide.
        url: '/docs/sample.pptx',
        fileType: 'PPTX',
        updatedLabel: 'May 2026',
      },
    ],
    followups: [
      'My surplus is $600 a month — turn this into a schedule',
      'Should I pay down my card debt before saving?',
      'How do I pick a high-yield account?',
      'What counts as an emergency?',
    ],
  },
  {
    thinking:
      'This is a planning request. A good plan needs a measurable target, a timeline, and checkpoints — I should propose defaults the user can adjust instead of asking too many questions up front.',
    content:
      'A plan works best when it has three parts: a target, a cadence, and checkpoints [1].\n\n**Target — define done.** Pick the number or outcome you want and write it down; vague goals quietly expand.\n\n**Cadence — make it automatic.** A fixed transfer or recurring block of time every week removes the daily decision entirely.\n\n**Checkpoints — review monthly, not daily.** Once a month, compare where you are against where the plan says you should be, and adjust the cadence rather than the target. A twelve-month schedule makes the drift visible early [2].\n\nWant me to draft this as a month-by-month table you can track against?',
    sources: [
      {
        id: 1,
        title: 'Anatomy of a Financial Plan',
        markdown: `## Target, cadence, checkpoints

Every durable plan reduces to three commitments:

- **A target** with a number and a date. "Save more" is a wish; "*$9,000 by June 30*" is a plan.
- **A cadence** that runs without a decision — an automatic transfer, a standing order, a calendar block.
- **Checkpoints** on a fixed rhythm, where you adjust the *cadence*, never the target.

### Common failure modes

| Failure | Symptom | Fix |
| :--- | :--- | :--- |
| No number | "Doing my best" | Write the target down |
| Manual cadence | Skipped months | Automate the transfer |
| Daily checking | Anxiety, tinkering | Monthly review only |
| Moving the goalposts | Target shrinks to match reality | Adjust cadence instead |

> A plan you re-negotiate daily is not a plan; it is a mood.`,
        // Not a file: the recipe draws it with ArticlePreview, from the
        // placeholder article in public/docs.
        fileType: ARTICLE_FILE_TYPE,
        updatedLabel: 'Jun 2026',
      },
      {
        id: 2,
        title: 'Twelve-Month Savings Schedule (Worked Example)',
        markdown: `## Worked example: $9,000 in twelve months

Assumes a **$750/month** base transfer, a small annual raise in month 7, and interest compounding monthly at 4.2% APY.

| Month | Deposit | Interest | Balance | Cumulative target | Drift |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Jan | $750 | $0 | $750 | $750 | $0 |
| Feb | $750 | $3 | $1,503 | $1,500 | +$3 |
| Mar | $750 | $5 | $2,258 | $2,250 | +$8 |
| Apr | $750 | $8 | $3,016 | $3,000 | +$16 |
| May | $750 | $11 | $3,777 | $3,750 | +$27 |
| Jun | $750 | $13 | $4,540 | $4,500 | +$40 |
| Jul | $800 | $16 | $5,356 | $5,250 | +$106 |
| Aug | $800 | $19 | $6,175 | $6,000 | +$175 |
| Sep | $800 | $22 | $6,997 | $6,750 | +$247 |
| Oct | $800 | $24 | $7,821 | $7,500 | +$321 |
| Nov | $800 | $27 | $8,648 | $8,250 | +$398 |
| Dec | $800 | $30 | $9,478 | $9,000 | **+$478** |

### How to use the drift column

- Drift **positive and growing**: your cadence is beating the plan — consider raising the target next cycle, not the transfer.
- Drift **negative two months running**: raise the cadence by the average monthly shortfall.
- One bad month is noise; two is a trend.`,
      },
    ],
    followups: [
      'Yes, draft the month-by-month table',
      'What should I do if I miss two months in a row?',
      'Help me pick a target I can actually hit',
    ],
  },
  {
    thinking:
      'The user wants ideas. Brainstorms are most useful when the options are genuinely different from each other, not five variations of one idea. I will group by effort level so they can pick based on energy, not just appeal.',
    content:
      'Here are a few directions, grouped by how much effort they take.\n\n**Quick wins (this week):** audit subscriptions and cancel anything unused for 60 days [1]; switch one recurring bill to an annual plan for the discount.\n\n**Medium lift (this month):** set a per-category spending cap in your banking app and turn on alerts; renegotiate one fixed bill — internet and insurance respond well to a single call [2].\n\n**Bigger swings (this quarter):** consolidate accounts so every dollar has one home, then automate the flow between them.\n\nI can go deeper on any of these — the subscription audit is usually the fastest payoff [1].',
    sources: [
      {
        id: 1,
        title: 'The 60-Day Subscription Audit',
        markdown: `## Finding the leaks

The average household pays for **12 subscriptions** and can name 8. The audit takes one evening.

### Method

1. Export 90 days of transactions (CSV works fine).
2. Filter for recurring merchants — same amount, monthly rhythm.
3. For each one, ask a single question: *have I used this in the last 60 days?*
4. No → cancel today. Unsure → cancel anyway; re-subscribing takes two minutes.

\`\`\`sql
-- if your bank export lands in a spreadsheet or db, this finds candidates
SELECT merchant, amount, COUNT(*) AS charges
FROM transactions
WHERE date > CURRENT_DATE - INTERVAL '90 days'
GROUP BY merchant, amount
HAVING COUNT(*) >= 3;
\`\`\`

### Typical findings

- Duplicate streaming services covering the same catalog
- Free trials that quietly converted
- Annual renewals nobody remembers approving

> The audit's payoff is not just the cancelled charges — it is the inventory. You cannot manage what you have not listed.`,
      },
      {
        id: 2,
        title: 'Negotiating Fixed Bills: Scripts That Work',
        markdown: `## One call, real savings

Internet, insurance, and phone plans are priced for inertia. A single retention call typically recovers **10–25%**.

### The script skeleton

1. **Open with the ask**: "I'm reviewing my bills and this one is above market — what can you do?"
2. **Name a competitor's number** (have it open in a tab).
3. **Let silence work.** The first offer is rarely the last.
4. **Take the retention offer in writing** — confirmation email or chat transcript.

### What to expect by bill type

| Bill | Typical win | Best lever | Frequency |
| :--- | :---: | :--- | :--- |
| Internet | 15–25% | Competitor promo price | Every 12 months |
| Auto insurance | 10–20% | Re-quote + bundle | Every renewal |
| Phone plan | 10–15% | Downgrade threat, MVNO quote | Every 12 months |
| Streaming bundles | 20–30% | Pause instead of cancel | As needed |

**Key detail:** promotions expire silently. Put the expiry date on your calendar the day you accept the offer.`,
      },
    ],
    followups: [
      'Walk me through the subscription audit',
      'Which bill is worth renegotiating first?',
      'Draft what I should say on that call',
    ],
  },
  // Kept out of the cycle (it has a `match`) and played on demand: the answer
  // survives a mid-stream drop, so the turn ends up 'recovered' rather than
  // failed. Exercises the one state that is easy to get wrong — a good answer
  // that must not be dressed up as a problem.
  {
    match: /hiccup|recover|drop|flaky|glitch/i,
    thinking:
      'The user wants to see what a turn looks like when the stream stumbles partway through. The answer itself is unremarkable — the point is that nothing about it should look alarming afterwards.',
    content:
      'Here is a normal answer that happens to arrive over an unreliable connection.\n\nThe stream drops partway through this paragraph and picks up again where it left off. Nothing is lost, and nothing is repeated — the reconnect is invisible in the text itself.\n\nWhen it finishes, the only trace of the interruption is the word **recovered** next to the duration under this message. Open it to see where the drop landed on the timeline. There is no badge, no warning tint, and the copy and regenerate controls stay exactly where they were, because from your side nothing actually went wrong.',
    followups: ['What happens when the stream fails completely?', 'Show me a normal turn again'],
    fault: { at: 0.35, message: 'Connection dropped and resumed' },
  },
  // The other half of the pair: the same drop, except it never comes back. The
  // turn keeps what it streamed and the rail frays where the answer stops.
  {
    match: /fail|fatal|dead|completely|break/i,
    thinking:
      'This one is meant to die partway. What matters is what the reader is left with: enough of the answer to see where it got to, and a way to run it again.',
    content:
      'A turn can also stop for good. This sentence is as far as this one gets before the connection goes',
    fault: { at: 0.72, message: 'Connection lost. The model stopped responding.', fatal: true },
  },
  // Played on demand: two diagrams streamed as ```mermaid fences, so the
  // drawing-while-arriving path gets exercised — a flowchart that grows node
  // by node, then a sequence diagram.
  {
    match: /diagram|mermaid|flowchart|draw/i,
    thinking:
      'A process question answers best as a picture. I will draw the approval path as a flowchart, then show the same transfer as the messages that pass between the parties, and keep the prose to what the diagrams cannot say.',
    content: `Here is how a wire transfer gets from your request to the recipient's account.

\`\`\`mermaid
flowchart TD
  A[Transfer requested] --> B{Over $10,000?}
  B -- No --> C[Automated fraud screen]
  B -- Yes --> D[Second approver signs off]
  D --> C
  C -->|Clear| E[Sent to the payment network]
  C -->|Flagged| F[Held for a specialist]
  F -->|Released| E
  E --> G[Settled in the recipient's account]
\`\`\`

Most transfers take the short path down the left: under the threshold, clear of the fraud screen, and settled the same business day. The two places a transfer can wait are the second approval and a specialist hold — both are people, not systems, which is why they are the ones worth asking about when a transfer is late.

The same transfer, as the messages that pass between you, your bank and the network:

\`\`\`mermaid
sequenceDiagram
  participant You
  participant Bank as Your bank
  participant Net as Payment network
  You->>Bank: Request a wire
  Bank->>Bank: Fraud screen
  Bank->>Net: Send payment
  Net-->>Bank: Accepted
  Bank-->>You: Transfer complete
\`\`\`

Once the network has accepted it, a wire can no longer be recalled by your bank alone — so the fraud screen is the last cheap place to stop one.`,
    followups: [
      'What triggers a specialist hold?',
      'How long does the second approval usually take?',
      'Draw the same flow for an ACH transfer',
    ],
  },
]

// Illustrative metadata for the trace panel. Applied after the fact, like the
// highlights below, so the turn literals above stay about their content.
for (const turn of cannedTurns) {
  turn.model = 'Example Model'
  turn.tokens = Math.round((turn.thinking.length + turn.content.length) / 4)
}

// Highlights are attached after the fact so each spec resolves against that
// turn's own source markdown — offsets index the source doc, not the answer.
function attachSourceHighlights(
  turn: CannedTurn,
  specs: { referenceNumber: number; phrase: string }[],
) {
  turn.highlights = sourceHighlights(turn.sources ?? [], specs)
}

attachSourceHighlights(cannedTurns[0], [
  { referenceNumber: 3, phrase: 'generated reference documents in the stress-test corpus' },
  { referenceNumber: 8, phrase: 'This working note supports answer marker' },
  { referenceNumber: 8, phrase: 'generated reference documents in the stress-test corpus' },
  { referenceNumber: 50, phrase: 'This working note supports answer marker' },
])

// Reference 1 gets two sections to show one source highlighting two passages.
attachSourceHighlights(cannedTurns[1], [
  {
    referenceNumber: 1,
    phrase: 'the right number depends on income stability, household structure',
  },
  { referenceNumber: 1, phrase: 'An emergency fund is insurance, not an investment' },
  { referenceNumber: 2, phrase: 'APYs move with the federal funds rate' },
  { referenceNumber: 3, phrase: 'money moved before it reaches the spending account' },
  {
    referenceNumber: 4,
    phrase: 'A buffer converts a volatile income stream into a steady personal',
  },
  { referenceNumber: 5, phrase: 'even while attacking debt' },
])
