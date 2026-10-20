import type { Message } from './types'
import type { FeatureFlags } from '../../lib/settings'

/**
 * Which `Message` fields a feature owns. Switching the feature off deletes
 * them just before render, which is why no component in this library has ever
 * heard of a feature flag — it only ever sees a message that genuinely lacks
 * reasoning, tools or sources.
 *
 * A feature with no fields (the demo's `actions`, which rides a ChatMessage
 * prop) simply has no entry; gate it where you render instead.
 */
export type MessageFieldMap<Id extends string = string> = Partial<
  Record<Id, readonly (keyof Message)[]>
>

/**
 * The field map for the features this library actually renders.
 *
 * A product with its own features extends this rather than replacing it —
 * spread it into a wider map and add your own ids.
 *
 * `sources` takes `highlights` with it deliberately: a highlight without its
 * source is a mark the reader cannot trace back, and Markdown only linkifies
 * `[n]` when sources are present, so the markers degrade to plain text instead
 * of becoming dead links.
 */
export const MESSAGE_FEATURE_FIELDS = {
  thinking: ['thinking', 'thinkingActive', 'thinkingSec'],
  tools: ['tools'],
  sources: ['sources', 'highlights'],
  followups: ['followups'],
  trace: ['trace'],
} as const satisfies MessageFieldMap

/**
 * Hides switched-off features by stripping the fields that drive them, just
 * before render.
 *
 * This is the whole reason a feature-flag system can sit outside the
 * components: gating happens on the data, so ChatMessage, ThinkingBlock and
 * the rest only ever see a message that genuinely lacks reasoning, tools or
 * sources. Nothing downstream has an `if (flags.x)` in it, which is what keeps
 * a flag added next quarter from touching twenty files.
 *
 * Only assistant messages are touched — none of these fields appear on a user
 * turn — and `error` is never stripped: a failed turn keeps its alert, because
 * that is a recovery path rather than a detail someone would switch off.
 *
 * Returns the SAME array when nothing is off, so a memoized caller does not
 * re-render the transcript on every keystroke elsewhere.
 */
export function applyFeatureGate<Id extends string>(
  messages: Message[],
  flags: FeatureFlags<Id>,
  fields: MessageFieldMap<Id> = MESSAGE_FEATURE_FIELDS as MessageFieldMap<Id>,
): Message[] {
  const off = (Object.keys(fields) as Id[]).filter((id) => flags[id] === false)
  if (off.length === 0) return messages

  return messages.map((m) => {
    if (m.role !== 'assistant') return m
    const next = { ...m }
    for (const id of off) {
      for (const field of fields[id] ?? []) delete next[field]
    }
    return next
  })
}
