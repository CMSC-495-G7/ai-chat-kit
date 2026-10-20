import type { Source } from '../../engine/types'

export type SourceStripProps = {
  sources: Source[]
  onCite: (id: number) => void
}
