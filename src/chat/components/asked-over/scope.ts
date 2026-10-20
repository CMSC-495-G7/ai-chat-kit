import type { AskedOverChip, AskedOverScope } from '../../engine/types'

/** A stable identity for one recorded filter. */
function chipKey(chip: AskedOverChip): string {
  const target = chip.ref
    ? `${chip.ref.group}:${chip.ref.value}`
    : `${chip.prefix ?? ''}:${chip.label}`
  return `${chip.kind}|${target}`
}

/**
 * Whether the filters in force now differ from the ones a question recorded.
 *
 * Compares filters, not totals: a count that moved because new data landed is
 * not the viewer changing the question's scope, and badging it would cry wolf
 * on every tab left open overnight.
 *
 * Lives beside the strip rather than in the filters component because it
 * reads nothing but the shared scope types — the transcript should be able to
 * answer this without importing the rail.
 */
export function scopeChanged(recorded: AskedOverScope, current: AskedOverChip[]): boolean {
  if (recorded.chips.length !== current.length) return true
  const left = recorded.chips.map(chipKey).sort()
  const right = current.map(chipKey).sort()
  return left.some((key, index) => key !== right[index])
}
