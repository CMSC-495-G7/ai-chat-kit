import type { Persona } from '../../engine/types'

export type PersonaMenuProps = {
  personas: Persona[]
  persona: string
  onChange: (id: string) => void
  /**
   * Compact renders an icon-only trigger — the label doesn't fit the widget
   * row. Independent of this: the non-compact pill also collapses to an
   * icon on its own once its ancestor `@container/composer` (see `Composer`)
   * is too narrow for it — no prop for that, it's CSS-only.
   */
  compact: boolean
}
