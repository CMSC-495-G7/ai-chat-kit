import type { Persona, PromptTemplate } from '../../engine/types'

export type PersonaPanelProps = {
  /** The same personas the composer's persona menu offers. */
  personas: Persona[]
  /** Selected persona id. */
  personaId: string
  onPersonaChange: (id: string) => void
  /**
   * The prompt layers framing each message, stacked in priority order. Read
   * only here — the panel shows what is in force, it isn't where they're
   * authored.
   */
  templates: PromptTemplate[]
}
