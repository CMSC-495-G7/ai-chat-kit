import DOMPurify from 'dompurify'

// An article's rich text is written by whoever may edit the knowledge base,
// and arrives through a backend — so it is treated as untrusted. An instance
// of its own, so these hooks don't change how any other module sanitises; and
// made on first use, so importing the library touches no `window`.
let purifier: ReturnType<typeof DOMPurify> | undefined

function purify() {
  if (purifier) return purifier
  purifier = DOMPurify(window)
  purifier.addHook('afterSanitizeAttributes', (node) => {
    // A link leaves the app rather than replacing it, and can't reach back.
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
    if (node.tagName === 'IMG') node.setAttribute('loading', 'lazy')
    // Inline styles stay — colour and alignment are part of what the author
    // wrote — except the one that lifts an element out of the text to sit
    // over something else.
    if (node instanceof HTMLElement && node.style.position) node.style.removeProperty('position')
  })
  return purifier
}

const OPTIONS = {
  USE_PROFILES: { html: true },
  // A <style> would restyle the whole page, not just the article, and a form
  // control would invite input that goes nowhere.
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea'],
}

/**
 * Rich text made safe to place in the page: scripts, event handlers,
 * `javascript:` URLs, frames, embedded objects and form controls are dropped,
 * and nothing keeps a `position` of its own. Links open in a new tab.
 */
export function sanitizeRichText(html: string): string {
  return purify().sanitize(html, OPTIONS)
}

// The tags a rich text editor writes. Markup is taken to be one of them being
// closed, or one of the few that never are — so neither "press <Enter>" nor
// "a<b and b>a" is mistaken for it.
const CLOSED =
  'p|div|span|a|b|i|u|s|em|strong|sub|sup|ul|ol|li|h[1-6]|table|tr|th|td|blockquote|pre|code|font|center'
const MARKUP = new RegExp(`</(${CLOSED})\\s*>|<(br|hr|img)(\\s[^<>]*)?/?>`, 'i')

/** Does this string hold markup, as opposed to text that happens to contain a "<"? */
export function looksLikeHtml(value: string): boolean {
  return MARKUP.test(value)
}
