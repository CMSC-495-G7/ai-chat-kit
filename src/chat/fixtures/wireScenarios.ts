// What the simulated server says. A scenario is a script in the server's own
// terms — reasoning, tool calls, an answer, an error — which
// ../recipes/shared/simulatedNetwork.ts plays as wire events.
import type { CannedTurn } from '../engine/chatEngine'
import type { ToolStatus, WSHighlight, WSSource, WSTurnError } from '../engine/wsProtocol'
import { cannedTurns } from './cannedTurns'

/** One step of a scenario, in the order it plays out. */
export type ScenarioStep =
  | { kind: 'thinking'; text: string }
  | {
      kind: 'tool'
      name: string
      input?: Record<string, unknown>
      /** How the call ends. Defaults to 'completed'. */
      outcome?: Exclude<ToolStatus, 'started'>
      output?: unknown
      error?: string
      /** How long the tool "runs" between started and its outcome. */
      durationMs?: number
    }
  | {
      kind: 'answer'
      text: string
      sources?: WSSource[]
      highlights?: WSHighlight[]
      followups?: string[]
      /** Problems reported with the finished answer rather than as they happen. */
      errors?: WSTurnError[]
      model?: string
      tokens?: number
    }
  | ({ kind: 'error' } & WSTurnError)

export type Scenario = ScenarioStep[]

/** Four tool calls, each answered by a line of reasoning, then the answer. */
const toolHeavy: Scenario = [
  {
    kind: 'thinking',
    text: 'The user wants current market context, and I should not lean on figures that could be a quarter stale. I will start with the two headline benchmarks.',
  },
  {
    kind: 'tool',
    name: 'get_benchmark_rates',
    input: { series: ['fed_funds', 'us10y'], region: 'US' },
    output: { fed_funds: 4.25, us10y: 3.98, as_of: '2026-07-15' },
    durationMs: 900,
  },
  {
    kind: 'thinking',
    text: 'Rates alone do not tell the whole story. I should see how equities and bonds behaved over the same window.',
  },
  {
    kind: 'tool',
    name: 'market_snapshot',
    input: { symbols: ['SPY', 'AGG'], window: '1M' },
    output: { SPY: { change_pct: 2.4 }, AGG: { change_pct: 0.6 } },
    durationMs: 1100,
  },
  {
    kind: 'thinking',
    text: 'Both are up. Before I lean on that, I want their current mix rather than a guess at it.',
  },
  {
    kind: 'tool',
    name: 'get_account_allocation',
    input: { account_id: 'demo-001' },
    output: { equities_pct: 62, bonds_pct: 33, cash_pct: 5, last_updated: '2026-07-01' },
    durationMs: 750,
  },
  {
    kind: 'answer',
    text: 'Here is where things stand as of yesterday’s close.\n\nThe fed funds rate sits at **4.25%** and the 10-year Treasury yields **3.98%**, so the curve remains mildly inverted at the short end. Over the past month broad equities added about 2.4% while core bonds gained 0.6%.\n\nYour account is 62% equities, 33% bonds and 5% cash — close to a classic 70/30 split with a little more cash than that model calls for. There is no urgency to rebalance.',
    followups: ['What would moving the cash into bonds change?', 'Show me the same for last year'],
    model: 'demo-sim',
    tokens: 412,
  },
]

/** Two quote sources fail before a cached one answers; the model works around it. */
const toolFailure: Scenario = [
  {
    kind: 'thinking',
    text: 'A live price needs a live quote. I will try the primary feed first.',
  },
  {
    kind: 'tool',
    name: 'live_quote',
    input: { symbol: 'AGG', feed: 'primary' },
    outcome: 'failed',
    error: 'Upstream timed out after 5s',
    durationMs: 1200,
  },
  {
    kind: 'thinking',
    text: 'The primary feed timed out. The cached close is a few hours old, which is fine for this question as long as I say so.',
  },
  {
    kind: 'tool',
    name: 'cached_quote',
    input: { symbol: 'AGG' },
    output: { price: 98.42, as_of: '2026-07-15T16:00:00-04:00' },
    durationMs: 500,
  },
  {
    kind: 'answer',
    text: 'The live feed did not answer, so this is **yesterday’s close**: AGG finished at $98.42.\n\nThat is recent enough to reason about an allocation, and not recent enough to trade on.',
    followups: ['Try the live quote again'],
    model: 'demo-sim',
    tokens: 188,
  },
]

/** Two tools succeed, the answer starts, and the server gives up for good. */
const fatalError: Scenario = [
  { kind: 'thinking', text: 'I need the balance and the run rate before I can compare them.' },
  {
    kind: 'tool',
    name: 'get_balances',
    input: { accounts: 'operating' },
    output: { available: 4_180_000 },
    durationMs: 700,
  },
  {
    kind: 'tool',
    name: 'get_run_rate',
    input: { window: '90d' },
    output: { daily_outflow: 61_500 },
    durationMs: 700,
  },
  { kind: 'answer', text: 'Available cash covers roughly 68 days of forecast outflows, which is' },
  {
    kind: 'error',
    message: 'The model stopped responding.',
    code: 'UPSTREAM_UNAVAILABLE',
    source: 'model',
    recoverable: false,
  },
]

/** A good answer from a server that had a bad time producing it. */
const degraded: Scenario = [
  {
    kind: 'thinking',
    text: 'I will search the policy library, then rank what comes back before quoting from it.',
  },
  {
    kind: 'tool',
    name: 'search_policies',
    input: { query: 'liquidity floor' },
    output: { hits: 6, index: 'fallback' },
    durationMs: 900,
  },
  {
    kind: 'error',
    message: 'Search fell back to the secondary index',
    code: 'SEARCH_FALLBACK',
    source: 'retrieval',
    recoverable: true,
  },
  {
    kind: 'tool',
    name: 'rerank',
    input: { top_k: 6 },
    outcome: 'failed',
    error: 'Reranker unavailable',
    durationMs: 600,
  },
  {
    kind: 'answer',
    text: 'The liquidity policy sets a floor of **45 days** of forecast outflows across the operating accounts.\n\nI found that in the policy library, though the search ran on the secondary index and the results were not reranked, so treat the wording as accurate and the choice of passage as second best.',
    errors: [
      {
        message: 'Search fell back to the secondary index',
        code: 'SEARCH_FALLBACK',
        source: 'retrieval',
        recoverable: true,
      },
      {
        message: 'Results were not reranked',
        code: 'RERANK_SKIPPED',
        source: 'retrieval',
        count: 2,
        recoverable: true,
      },
    ],
    followups: ['Run that search again'],
    model: 'demo-sim',
    tokens: 231,
  },
]

/**
 * A canned turn in wire terms: reasoning, then the answer. A scripted fault
 * splits the answer in two with an error event between the halves — which
 * ends the turn there when it is fatal.
 */
function fromCanned(turn: CannedTurn): Scenario {
  const answer = {
    sources: turn.sources,
    highlights: turn.highlights,
    followups: turn.followups,
    errors: turn.errors?.map((fault) => ({ ...fault, recoverable: true })),
    model: turn.model,
    tokens: turn.tokens,
  }
  const steps: Scenario = [{ kind: 'thinking', text: turn.thinking }]
  if (!turn.fault) return [...steps, { kind: 'answer', text: turn.content, ...answer }]

  const { at, fatal, ...fault } = turn.fault
  const words = turn.content.split(/(?<=\s)/)
  const cut = Math.floor(words.length * at)
  return [
    ...steps,
    { kind: 'answer', text: words.slice(0, cut).join('') },
    { kind: 'error', ...fault, recoverable: !fatal },
    { kind: 'answer', text: words.slice(cut).join(''), ...answer },
  ]
}

const onDemand = cannedTurns.filter((turn) => turn.match)
const cycle = cannedTurns.filter((turn) => !turn.match).map(fromCanned)

/**
 * A server's worth of scenarios. Keywords in the prompt pick one on cue — the
 * first match wins — and anything else cycles through the ordinary answers.
 * Each picker keeps its own place in that cycle, so two stories never share it.
 */
export function createScenarioPicker(): (prompt: string) => Scenario {
  let next = 0
  return (prompt) => {
    if (/degraded|partial|issues/i.test(prompt)) return degraded
    if (/error/i.test(prompt)) return fatalError
    if (/quote|price/i.test(prompt)) return toolFailure
    if (/tool|search|rate|market/i.test(prompt)) return toolHeavy
    const matched = onDemand.find((turn) => turn.match!.test(prompt))
    return matched ? fromCanned(matched) : cycle[next++ % cycle.length]
  }
}
