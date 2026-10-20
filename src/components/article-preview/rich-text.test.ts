import { describe, expect, it } from 'vitest'
import { looksLikeHtml, sanitizeRichText } from './rich-text'

/** The sanitised markup as a tree, so a test asks about elements rather than strings. */
function clean(html: string) {
  const box = document.createElement('div')
  box.innerHTML = sanitizeRichText(html)
  return box
}

describe('sanitizeRichText', () => {
  it('keeps what an author writes: structure, emphasis, tables, pictures', () => {
    const box = clean(
      '<h3>Steps</h3><p>Do <b>this</b> and <i>that</i>.</p><ul><li>One</li></ul>' +
        '<table><tr><th>A</th><td>B</td></tr></table><img alt="A chart" src="https://cdn.example.com/chart.png">',
    )
    for (const tag of ['h3', 'p', 'b', 'i', 'ul', 'li', 'table', 'th', 'td', 'img']) {
      expect(box.querySelector(tag), tag).not.toBeNull()
    }
    expect(box.querySelector('img')).toHaveAttribute('alt', 'A chart')
  })

  it('keeps inline colour and alignment', () => {
    const span = clean('<p style="text-align: center"><span style="color: red">Warning</span></p>')
    expect(span.querySelector('p')!.style.textAlign).toBe('center')
    expect(span.querySelector('span')!.style.color).toBe('red')
  })

  it('drops scripts, style sheets, frames and embedded objects', () => {
    const box = clean(
      '<p>Kept</p><script>alert(1)</script><style>body{display:none}</style>' +
        '<iframe src="https://example.com"></iframe><object data="x.swf"></object><embed src="x.swf">',
    )
    expect(box.querySelectorAll('script, style, iframe, object, embed')).toHaveLength(0)
    expect(box).toHaveTextContent('Kept')
  })

  it('drops event handlers and javascript: addresses', () => {
    const box = clean(
      '<img src="x.png" onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(2)">Run</a>',
    )
    expect(box.querySelector('img')).not.toHaveAttribute('onerror')
    expect(box.querySelector('a')).not.toHaveAttribute('href')
    expect(box.querySelector('a')).not.toHaveAttribute('onclick')
  })

  it('drops form controls but keeps their words', () => {
    const box = clean(
      '<form action="/collect"><input name="password"><button>Sign in</button></form>',
    )
    expect(box.querySelectorAll('form, input, button')).toHaveLength(0)
    expect(box).toHaveTextContent('Sign in')
  })

  it('opens every link in a new tab, with no way back to the app', () => {
    const link = clean('<a href="https://example.com/policy">Policy</a>').querySelector('a')!
    expect(link).toHaveAttribute('href', 'https://example.com/policy')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('takes the position off an element that tries to sit over the page', () => {
    const overlay = clean(
      '<div style="position: fixed; inset: 0; background: red">Overlay</div>',
    ).querySelector('div')!
    expect(overlay.style.position).toBe('')
    expect(overlay.style.background).toBe('red')
  })

  it('loads pictures lazily', () => {
    expect(clean('<img src="a.png">').querySelector('img')).toHaveAttribute('loading', 'lazy')
  })
})

describe('looksLikeHtml', () => {
  it.each(['<p>Hello</p>', 'Line one<br>line two', 'Some <b>bold</b> text', '<img src="a.png" />'])(
    'reads %s as markup',
    (value) => expect(looksLikeHtml(value)).toBe(true),
  )

  it.each(['Plain text', 'Under 5 < 10 and over 3 > 1', 'a<b and b>a', 'Press <Enter> to send'])(
    'reads %s as text',
    (value) => expect(looksLikeHtml(value)).toBe(false),
  )
})
