import { describe, expect, it } from 'vitest'
import { documentKindOf } from './kind'

describe('documentKindOf', () => {
  it.each([
    ['PDF', 'pdf'],
    ['application/pdf', 'pdf'],
    ['report.pdf', 'pdf'],
    ['DOCX', 'docx'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
    ['Runbook.DOCX', 'docx'],
    ['PPTX', 'pptx'],
    ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'pptx'],
    ['/docs/sample.pptx', 'pptx'],
  ])('reads %s as %s', (hint, kind) => {
    expect(documentKindOf(hint)).toBe(kind)
  })

  it('ignores a URL’s query and fragment', () => {
    expect(documentKindOf('https://files.example.com/deck.pptx?token=abc#slide=3')).toBe('pptx')
    expect(documentKindOf('https://files.example.com/view?file=deck.pptx')).toBeNull()
  })

  it('returns null for what the preview cannot draw', () => {
    for (const hint of [undefined, '', 'XLSX', 'Web page', 'slides.ppt', 'notes.doc']) {
      expect(documentKindOf(hint)).toBeNull()
    }
  })
})
