import type { Highlight, Source } from '../../engine/types'

export type MarkdownProps = {
  text: string
  streaming?: boolean
  /** When present, inline [n] markers matching a source id become chips. */
  sources?: Source[]
  onCite?: (sourceId: number) => void
  /** Passages to highlight, grouped by referenceNumber. */
  highlights?: Highlight[]
  /** The reference (referenceNumber) whose passages should currently highlight. */
  activeRef?: number | null
}
