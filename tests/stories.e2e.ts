import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from './story'

// Checks that hold for the library as a whole, read from the built
// Storybook's index: every story renders, and every component has enough of
// them. A new story or component is covered the moment it is added.

type Entry = { id: string; title: string; name: string; type: 'story' | 'docs' }

const index = JSON.parse(readFileSync(path.resolve('storybook-static/index.json'), 'utf8')) as {
  entries: Record<string, Entry>
}
const stories = Object.values(index.entries).filter((entry) => entry.type === 'story')

/** Stories whose whole point is that nothing is drawn. */
const RENDERS_NOTHING = new Set(['chat-components-recentchatspanel--empty'])

/** The areas whose entries are components, as opposed to recipes or brand pages. */
const COMPONENT_AREAS = ['Primitives/', 'Components/', 'Chat/Components/']
const MINIMUM_STORIES = 3

test.describe('every story renders', () => {
  for (const entry of stories) {
    test(`${entry.title} › ${entry.name}`, async ({ story, page }) => {
      const root = await story.open(entry.id)
      if (RENDERS_NOTHING.has(entry.id)) return
      // Overlays portal out of the root, so "drew something" is asked of the page.
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.body.innerText.trim().length +
                document.querySelectorAll('#storybook-root *').length,
            ),
          { message: 'the story drew nothing' },
        )
        .toBeGreaterThan(0)
      await expect(root).toBeAttached()
    })
  }
})

test('every component has at least three stories', () => {
  const counts = new Map<string, number>()
  for (const entry of stories) {
    if (!COMPONENT_AREAS.some((area) => entry.title.startsWith(area))) continue
    counts.set(entry.title, (counts.get(entry.title) ?? 0) + 1)
  }
  const short = [...counts].filter(([, count]) => count < MINIMUM_STORIES)
  expect(short, `components with fewer than ${MINIMUM_STORIES} stories`).toEqual([])
})

test('a story renders in dark mode and in each palette', async ({ story, page }) => {
  for (const palette of ['default', 'classic', 'deep', 'graphite'] as const) {
    await story.open('primitives-button--playground', { mode: 'dark', palette })
    await expect(page.locator('html')).toHaveClass(new RegExp(`dark.*chat-theme-${palette}`))
  }
})

test('a story renders in each custom palette, applied as inline variables', async ({
  story,
  page,
}) => {
  for (const palette of ['teal', 'plum', 'crimson'] as const) {
    await story.open('primitives-button--playground', { mode: 'dark', palette })
    const html = page.locator('html')
    await expect(html).toHaveClass(/chat-theme-custom/)
    await expect
      .poll(() => html.evaluate((el) => el.style.getPropertyValue('--brand-600')))
      .toMatch(/^#[0-9a-f]{6}$/)
  }
})
