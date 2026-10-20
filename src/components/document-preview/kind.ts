import type { DocumentKind } from './types'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

/**
 * Which renderer a file needs, read from whatever the host knows about it: a
 * file-type label ("PDF"), a MIME type, a file name or a URL. Null means the
 * preview can't draw it, and the host should offer no way in.
 *
 * Kept apart from the component so a host can ask without loading a renderer.
 */
export function documentKindOf(hint: string | undefined): DocumentKind | null {
  if (!hint) return null
  // A URL's query and fragment say nothing about the file.
  const name = hint.toLowerCase().split(/[?#]/)[0]
  if (name === 'pdf' || name === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (name === 'docx' || name === DOCX_MIME || name.endsWith('.docx')) return 'docx'
  if (name === 'pptx' || name === PPTX_MIME || name.endsWith('.pptx')) return 'pptx'
  return null
}
