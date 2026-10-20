import type { Suggestion } from '../../engine/types'

/**
 * Suggestions matching a draft, best first: those the draft begins, then
 * those with a word that begins with it, then any other occurrence. Case is
 * ignored; a suggestion identical to the draft is dropped — offering what is
 * already typed is noise.
 */
export function matchSuggestions(pool: Suggestion[], draft: string, limit: number): Suggestion[] {
  const q = draft.trim().toLowerCase()
  if (!q) return []
  const ranked: { s: Suggestion; rank: number }[] = []
  const seen = new Set<string>()
  for (const s of pool) {
    const t = s.text.toLowerCase()
    if (t === q || seen.has(t)) continue
    const at = t.indexOf(q)
    if (at === -1) continue
    seen.add(t)
    ranked.push({ s, rank: at === 0 ? 0 : /\s/.test(t[at - 1]) ? 1 : 2 })
  }
  // Array.prototype.sort is stable, so equal ranks keep the pool's order.
  return ranked
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((r) => r.s)
}

/** The rest of `text` after `draft`, when `text` begins with it — the ghost
 *  completion drawn after the caret. Empty when it doesn't. */
export function completionFor(text: string | undefined, draft: string): string {
  if (!text || !draft || draft.includes('\n')) return ''
  return text.toLowerCase().startsWith(draft.toLowerCase()) ? text.slice(draft.length) : ''
}
