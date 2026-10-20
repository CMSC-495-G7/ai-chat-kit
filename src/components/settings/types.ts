import type { FeatureCatalogue, FeatureFlags } from '../../lib/settings/types'
import type { HighlightOption, PaletteOption } from '../../lib/settings/appearance'

/**
 * Copy for a section heading. Every settings control takes these so a tenant
 * can retitle a section without forking the component; each has a sensible
 * default, so passing nothing is the normal case.
 */
export type SectionCopy = {
  title?: string
  description?: string
}

export type FeatureTogglesProps<Id extends string = string> = {
  catalogue: FeatureCatalogue<Id>
  flags: FeatureFlags<Id>
  onChange: (id: Id, on: boolean) => void
  /** Rendered above the first section — preamble that belongs to the whole
   *  list rather than to one group. */
  intro?: string
  /**
   * Draw a vertical spine down the left with a node per section, the way the
   * demo narrates a turn in order. Off by default: it implies the sections are
   * a sequence, which is true of "before / in / after the answer" and false of
   * most settings groupings.
   */
  spine?: boolean
}

export type PalettePickerProps = SectionCopy & {
  options: PaletteOption[]
  value: string
  onChange: (id: string) => void
}

export type HighlightPickerProps = SectionCopy & {
  options: HighlightOption[]
  value: string
  onChange: (id: string) => void
}
