// Shared fixtures for the chat stories. Plain data in the library's own types,
// so every story — and the live conversation recipe — reads the same sources,
// traces and turns. A small, self-contained corpus: the library never imports
// from an app, so none of it comes from a demo's mocks.
import type { CannedTurn } from '../engine/chatEngine'
import { sourceHighlights } from '../engine/highlights'
import type {
  AskedOverScope,
  Message,
  Persona,
  PromptTemplate,
  QueuedMessage,
  RecentChat,
  Source,
  Suggestion,
  ToolCall,
  TurnTrace,
} from '../engine/types'

// ---------------------------------------------------------------------------
// Sources and highlights
// ---------------------------------------------------------------------------

export const sources: Source[] = [
  {
    id: 1,
    title: 'Treasury liquidity policy (2026)',
    fileType: 'PDF',
    pageCount: 14,
    updatedLabel: 'Mar 2026',
    url: 'https://library.example.com/policies/liquidity-2026.pdf',
    markdown: `## Liquidity policy

Operating accounts must hold **at least 30 days** of forecast outflows at all times.

### Buffers

| Tier | Minimum | Review |
| :--- | ---: | :--- |
| Operating | 30 days | Weekly |
| Reserve | 90 days | Monthly |

Any shortfall below the operating minimum is escalated to the treasurer within one business day.`,
  },
  {
    id: 2,
    title: 'Q2 cash position report',
    fileType: 'XLSX',
    updatedLabel: 'Jul 2026',
    markdown: `## Cash position — Q2

Available balance across operating accounts closed the quarter at **$4.82M**, up 6% on Q1.

Payroll and vendor runs account for 71% of forecast outflows. The largest single outflow is the quarterly tax payment on the 15th.`,
  },
  {
    id: 3,
    title: 'Wire approval runbook',
    fileType: 'DOCX',
    pageCount: 6,
    updatedLabel: 'Aug 2026',
    markdown: `## Wire approvals

Wires over $250,000 need two approvers from different teams. Same-day wires close at 4:00 PM ET.

1. Initiator submits in the treasury portal.
2. First approver checks beneficiary details.
3. Second approver confirms against the callback log.`,
  },
]

export const highlights = sourceHighlights(sources, [
  { referenceNumber: 1, phrase: 'at least 30 days' },
  { referenceNumber: 1, phrase: 'escalated to the treasurer within one business day' },
  { referenceNumber: 2, phrase: 'closed the quarter at **$4.82M**' },
  { referenceNumber: 3, phrase: 'Wires over $250,000 need two approvers from different teams' },
])

export const answerMarkdown = `Your operating accounts are **within policy**. The liquidity policy requires 30 days of forecast outflows [1], and the Q2 report puts available balance at $4.82M [2] — about 41 days at the current run rate.

Two things to watch:

- The quarterly tax payment on the 15th is the largest single outflow [2].
- Any wire above $250,000 to cover it needs two approvers [3].

| Measure | Now | Policy |
| :--- | ---: | ---: |
| Days of cover | 41 | 30 |
| Reserve days | 96 | 90 |`

// ---------------------------------------------------------------------------
// Tools and traces
// ---------------------------------------------------------------------------

export const tools: Record<'running' | 'done' | 'failed', ToolCall> = {
  running: {
    toolCallId: 't-run',
    name: 'ledger.balances',
    status: 'started',
    input: { accounts: ['operating'], asOf: '2026-09-28' },
  },
  done: {
    toolCallId: 't-done',
    name: 'ledger.balances',
    status: 'completed',
    input: { accounts: ['operating'], asOf: '2026-09-28' },
    output: { available: 4_820_000, currency: 'USD', accounts: 3 },
  },
  failed: {
    toolCallId: 't-fail',
    name: 'market.live_quote',
    status: 'failed',
    input: { symbol: 'USD/EUR' },
    error: 'Upstream timed out after 8s',
  },
}

const STARTED = Date.parse('2026-09-28T14:02:11Z')

export const traces: Record<'ok' | 'recovered' | 'stopped' | 'failed', TurnTrace> = {
  ok: {
    status: 'ok',
    startedAt: STARTED,
    ms: 4_210,
    model: 'example-model',
    tokens: 812,
    steps: [
      { id: 'think', label: 'Reasoning', kind: 'thinking', at: 0, ms: 1_140 },
      { id: 't-done', label: 'ledger.balances', kind: 'tool', at: 1_180, ms: 620 },
      { id: 'answer', label: 'Answering', kind: 'content', at: 1_840, ms: 2_370 },
    ],
  },
  recovered: {
    status: 'recovered',
    startedAt: STARTED,
    ms: 6_930,
    model: 'example-model',
    tokens: 764,
    steps: [
      { id: 'think', label: 'Reasoning', kind: 'thinking', at: 0, ms: 980 },
      { id: 't-fail', label: 'market.live_quote', kind: 'tool', at: 1_000, ms: 8_000 },
      {
        id: 'fault-1',
        label: 'Quote service timed out',
        kind: 'fault',
        at: 2_400,
        fault: {
          message: 'Quote service timed out; answered from cached rates.',
          code: 'quote_timeout',
          source: 'tool:live_quote',
          detail: { cacheAgeMinutes: 14 },
        },
      },
      { id: 'answer', label: 'Answering', kind: 'content', at: 3_100, ms: 3_830 },
    ],
  },
  stopped: {
    status: 'stopped',
    startedAt: STARTED,
    ms: 2_050,
    steps: [
      { id: 'think', label: 'Reasoning', kind: 'thinking', at: 0, ms: 900 },
      { id: 'answer', label: 'Answering', kind: 'content', at: 940 },
    ],
  },
  failed: {
    status: 'failed',
    startedAt: STARTED,
    ms: 3_400,
    steps: [
      { id: 'think', label: 'Reasoning', kind: 'thinking', at: 0, ms: 1_020 },
      {
        id: 'fault-1',
        label: 'Connection lost',
        kind: 'fault',
        at: 3_380,
        fault: {
          message: 'The connection to the model was lost.',
          code: 'socket_closed',
          source: 'transport',
        },
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export const scope: AskedOverScope = {
  total: 12_408,
  capturedAt: '2026-09-28T14:02:10Z',
  chips: [
    { kind: 'scope', label: 'Last 90 days' },
    {
      kind: 'facet',
      prefix: 'Accounts',
      label: 'Operating — Alderfinch',
      ref: { group: 'accounts', value: 'ops' },
    },
    {
      kind: 'facet',
      prefix: 'Accounts',
      label: 'Payroll',
      ref: { group: 'accounts', value: 'pay' },
    },
    {
      kind: 'query',
      prefix: 'Loan Number contains',
      label: '1772',
      count: 4108,
      ref: { group: 'loans', value: '1772' },
    },
    { kind: 'custom', prefix: 'Tag', label: 'q3-offsite' },
  ],
}

export const question: Message = {
  id: 1,
  role: 'user',
  content: 'Are our operating accounts within the liquidity policy right now?',
}

export const answer: Message = {
  id: 2,
  role: 'assistant',
  content: answerMarkdown,
  thinking:
    'The policy sets a floor in days of forecast outflows. I need the current balance and the run rate, then compare. The Q2 report has both; the runbook matters only if a large wire is needed.',
  thinkingSec: 3,
  streaming: false,
  tools: [tools.done],
  sources,
  highlights,
  followups: [
    'How many days of cover after the tax payment?',
    'Who can approve a wire today?',
    'Show the reserve tier in detail',
  ],
  trace: traces.ok,
}

export const messages = {
  question,
  answer,
  thinking: {
    id: 3,
    role: 'assistant',
    content: '',
    thinking:
      'The policy sets a floor in days of forecast outflows. I need the current balance and',
    thinkingActive: true,
  } satisfies Message,
  streaming: {
    id: 4,
    role: 'assistant',
    content:
      'Your operating accounts are **within policy**. The liquidity policy requires 30 days of forecast',
    thinking: answer.thinking,
    thinkingSec: 3,
    streaming: true,
    tools: [tools.done],
    sources,
    highlights,
  } satisfies Message,
  recovered: {
    ...answer,
    id: 5,
    tools: [tools.failed],
    trace: traces.recovered,
  } satisfies Message,
  stopped: {
    id: 6,
    role: 'assistant',
    content: 'Your operating accounts are **within policy**. The liquidity policy requires',
    streaming: false,
    stopped: true,
    trace: traces.stopped,
  } satisfies Message,
  failed: {
    id: 7,
    role: 'assistant',
    content: '',
    streaming: false,
    trace: traces.failed,
    error: {
      message: 'The connection to the model was lost.',
      code: 'socket_closed',
      source: 'transport',
    },
  } satisfies Message,
  scopedQuestion: { ...question, id: 8, askedOver: scope } satisfies Message,
}

// ---------------------------------------------------------------------------
// Composer, queue, panels
// ---------------------------------------------------------------------------

export const personas: Persona[] = [
  { id: 'guide', name: 'Guide', hint: 'Warm, guided answers' },
  { id: 'analyst', name: 'Analyst', hint: 'Numbers first, cited' },
  { id: 'brief', name: 'Brief', hint: 'Short and direct' },
  { id: 'drafter', name: 'Drafter', hint: 'Ideas and drafts' },
]

export const suggestions: Suggestion[] = [
  { text: 'What changed in our cash position since Friday?', reason: 'Monday check-in' },
  { text: 'Which invoices are due this week?', reason: 'Popular in your org' },
  { text: 'Summarize policy updates from the last 7 days', reason: 'New this week' },
  { text: 'Show accounts with unusual activity today', reason: 'Trending today' },
  { text: 'Draft a status note for the treasury team', reason: 'Your routine' },
]

export const typeaheadPool: Suggestion[] = [
  { text: 'Draw the wire transfer approval flow as a diagram', reason: 'New this week' },
  { text: 'Summarize open approvals waiting on me', reason: 'Asked before' },
  { text: 'Show wires sent yesterday', reason: 'Popular in your org' },
]

export const queue: QueuedMessage[] = [
  { id: 101, text: 'How many days of cover after the tax payment?' },
  { id: 102, text: 'Who can approve a wire today?' },
  { id: 103, text: 'Draft a note to the treasurer summarising both answers' },
]

export const recentChats: RecentChat[] = [
  {
    id: 'current',
    title: 'Monthly liquidity position',
    snippet: 'Start with today’s available balance…',
    when: 'Active now',
  },
  {
    id: 'c2',
    title: 'Positive-pay exception on #4471',
    snippet: 'The check cleared with a payee mismatch…',
    when: 'Yesterday',
  },
  {
    id: 'c3',
    title: 'Rate lock on the Harbor Street loan',
    snippet: 'The lock expires on the 14th unless…',
    when: '3 days ago',
  },
  {
    id: 'c4',
    title: 'Q3 vendor run forecast',
    snippet: 'Vendor outflows are tracking 4% under…',
    when: 'Last week',
  },
]

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'session',
    priority: 3,
    label: 'Session context',
    body: 'The reader is signed in and their accounts are in scope. Cite the account or statement whenever one backs a claim.',
  },
  {
    id: 'base',
    priority: 1,
    label: 'Base persona',
    body: 'You are a treasury assistant. Lead with the number that matters and show the arithmetic behind it.',
  },
  {
    id: 'compliance',
    priority: 2,
    label: 'Compliance',
    body: 'Never recommend a specific security. Frame every projection as an estimate and name its assumption.',
  },
]

export const mermaidSource = `flowchart LR
  A[Initiator submits] --> B{Over $250k?}
  B -- No --> C[One approver]
  B -- Yes --> D[First approver]
  D --> E[Second approver, other team]
  C --> F[Released]
  E --> F`

// ---------------------------------------------------------------------------
// Canned turns for live stories (createCannedResponder cycles through these)
// ---------------------------------------------------------------------------

export const cannedTurns: CannedTurn[] = [
  {
    thinking: answer.thinking!,
    content: answerMarkdown,
    sources,
    highlights,
    followups: answer.followups,
    model: 'example-model',
    tokens: 812,
  },
  {
    match: /diagram|flow/i,
    thinking: 'A flowchart shows the approval branches more clearly than prose.',
    content: `Here is the wire approval flow [3]:\n\n\`\`\`mermaid\n${mermaidSource}\n\`\`\`\n\nSame-day wires close at 4:00 PM ET.`,
    sources,
    highlights,
    followups: ['What if the second approver is out?'],
  },
  {
    match: /fail|error/i,
    thinking: 'Pulling the live quote first.',
    content:
      'The live quote service is not answering, so this uses cached rates from 14 minutes ago: USD/EUR 0.9132.',
    fault: {
      at: 0.4,
      message: 'Quote service timed out; answered from cached rates.',
      code: 'quote_timeout',
      source: 'tool:live_quote',
    },
  },
]
