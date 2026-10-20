import type { Page } from '@playwright/test'

/**
 * Finds what a screen would show cut off.
 *
 * A layout bug is rarely an error. A chip runs past the edge of its field, a
 * label is chopped with no ellipsis to say so, a menu opens inside a box that
 * hides half of it — and nothing throws. This walks what is drawn and reports
 * three kinds of fault, each as a line a person can act on:
 *
 * - **hidden by a container**: an element reaches outside an ancestor that
 *   clips (`overflow: hidden` or `clip`), so part of it can never be seen.
 *   Ancestors that scroll are fine: the rest of the element is one scroll away.
 * - **text chopped silently**: text in a box that clips it, with no
 *   `text-overflow: ellipsis` to show that something is missing.
 * - **off the screen**: an element sticks out past the left or right edge of
 *   the page, and no scrolling container holds it.
 *
 * An ellipsis is a decision, not a fault, so truncated text that says so is not
 * reported. Anything visually hidden on purpose (screen-reader-only text, a
 * transparent checkbox) is skipped.
 */
export async function findCutOff(page: Page, scope = '#storybook-root'): Promise<string[]> {
  return page.evaluate((scopeSelector) => {
    const root = document.querySelector(scopeSelector)
    if (!root) return [`no element matches ${scopeSelector}`]

    const problems: string[] = []
    const seen = new Set<string>()
    const clips = (v: string) => v === 'hidden' || v === 'clip'
    const scrolls = (v: string) => v === 'auto' || v === 'scroll'

    const name = (el: Element) => {
      const tag = el.tagName.toLowerCase()
      const label = el.getAttribute('aria-label') ?? el.getAttribute('role')
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
      return `<${tag}${label ? ` ${label}` : ''}>${text ? ` "${text}"` : ''}`
    }
    const report = (kind: string, el: Element, detail: string) => {
      const line = `${kind}: ${name(el)} ${detail}`
      if (!seen.has(line)) {
        seen.add(line)
        problems.push(line)
      }
    }

    const all = [root, ...root.querySelectorAll('*')]
    for (const el of all) {
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)
        continue
      const rect = el.getBoundingClientRect()
      // Screen-reader-only text and zero-size boxes are hidden on purpose, and so
      // is whatever sits inside one.
      if (rect.width < 2 || rect.height < 2) continue
      let inHidden = false
      for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
        const box = up.getBoundingClientRect()
        if ((box.width < 2 || box.height < 2) && clips(getComputedStyle(up).overflowX)) {
          inHidden = true
          break
        }
      }
      if (inHidden) continue

      // 1. Reaching outside an ancestor that clips. Once an ancestor scrolls on an
      // axis, what lies beyond it on that axis is a scroll away, so nothing further
      // up can hide it.
      let heldX = false
      let heldY = false
      for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
        const parent = getComputedStyle(up)
        if (parent.position === 'fixed') break
        // Text that ends in an ellipsis says it was shortened. That is a choice.
        if (parent.textOverflow === 'ellipsis' && style.display.startsWith('inline')) break
        if (scrolls(parent.overflowX)) heldX = true
        if (scrolls(parent.overflowY)) heldY = true
        const clipsX = !heldX && clips(parent.overflowX)
        const clipsY = !heldY && clips(parent.overflowY)
        if (!clipsX && !clipsY) continue
        const box = up.getBoundingClientRect()
        // An absolutely positioned element is only clipped by an ancestor that is
        // positioned itself, or sits between it and its containing block.
        if (style.position === 'absolute' || style.position === 'fixed') {
          let contained = false
          for (let p: HTMLElement | null = el.parentElement; p; p = p.parentElement) {
            if (p === up) {
              contained = getComputedStyle(up).position !== 'static' || contained
              break
            }
            if (getComputedStyle(p).position !== 'static') break
          }
          if (!contained) continue
        }
        const out = {
          left: clipsX && rect.left < box.left - 1,
          right: clipsX && rect.right > box.right + 1,
          top: clipsY && rect.top < box.top - 1,
          bottom: clipsY && rect.bottom > box.bottom + 1,
        }
        if (out.left || out.right || out.top || out.bottom) {
          const sides = Object.entries(out)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join('/')
          report('hidden by a container', el, `runs past ${sides} of ${name(up)}`)
        }
      }

      // 2. Text chopped with no ellipsis.
      const hasText = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim(),
      )
      if (
        hasText &&
        clips(style.overflowX) &&
        el.scrollWidth > el.clientWidth + 1 &&
        style.textOverflow !== 'ellipsis'
      ) {
        report('text chopped silently', el, `needs ${el.scrollWidth}px, has ${el.clientWidth}px`)
      }
      if (
        hasText &&
        clips(style.overflowY) &&
        el.scrollHeight > el.clientHeight + 1 &&
        style.display !== 'inline'
      ) {
        report(
          'text chopped silently',
          el,
          `needs ${el.scrollHeight}px tall, has ${el.clientHeight}px`,
        )
      }

      // 3. Off the edge of the page, with nothing that scrolls to reach it.
      if (rect.left < -1 || rect.right > window.innerWidth + 1) {
        let held = false
        for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
          if (scrolls(getComputedStyle(up).overflowX)) {
            held = true
            break
          }
        }
        if (!held)
          report(
            'off the screen',
            el,
            `spans ${Math.round(rect.left)}px to ${Math.round(rect.right)}px of ${window.innerWidth}px`,
          )
      }
    }

    // The page itself should not scroll sideways: that is a table or a panel that escaped.
    const doc = document.documentElement
    if (doc.scrollWidth > window.innerWidth + 1) {
      problems.push(
        `the page scrolls sideways: ${doc.scrollWidth}px wide in a ${window.innerWidth}px window`,
      )
    }
    return problems
  }, scope)
}

/**
 * Text that is shortened with an ellipsis, so a test can say which of it is
 * acceptable. A truncated cell is a design choice; a truncated column header, or
 * a chip whose remove button went with it, is a fault. `findCutOff` leaves these
 * alone for that reason.
 */
export async function findTruncated(page: Page, scope = '#storybook-root'): Promise<string[]> {
  return page.evaluate((scopeSelector) => {
    const root = document.querySelector(scopeSelector)
    if (!root) return []
    const found: string[] = []
    for (const el of root.querySelectorAll<HTMLElement>('*')) {
      const style = getComputedStyle(el)
      if (style.textOverflow !== 'ellipsis' || style.overflowX === 'visible') continue
      if (el.scrollWidth <= el.clientWidth + 1) continue
      const where = el.closest('th')
        ? 'header'
        : el.closest('td')
          ? 'cell'
          : el.closest('[role=region]')
            ? 'panel'
            : 'other'
      found.push(`${where}: ${(el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50)}`)
    }
    return found
  }, scope)
}
