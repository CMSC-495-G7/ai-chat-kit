import { test as base, expect, type Locator, type Page } from '@playwright/test'

export type StoryGlobals = {
  mode?: 'light' | 'dark'
  palette?: 'default' | 'classic' | 'deep' | 'graphite' | 'teal' | 'plum' | 'crimson'
  density?: 'default' | 'compact'
}

export type Story = {
  /**
   * Opens one story on its own page and waits until it has rendered. `id` is
   * the story's id as Storybook writes it: the title and the export name,
   * lower-cased and hyphenated — `primitives-button--playground`. Returns the
   * story's root, to scope queries to what the story drew.
   */
  open: (id: string, globals?: StoryGlobals) => Promise<Locator>
  /** Errors the page has raised so far: uncaught exceptions and console errors. */
  errors: string[]
}

/** A request the test itself blocked, or a missing favicon, is not a fault in a story. */
const IGNORED = [/Failed to load resource/, /net::ERR_/]

async function waitForStory(page: Page) {
  // Storybook marks <body> once it has decided what to show: the story, or
  // its own error screen. Waiting on the mark, not on a timer, keeps this
  // honest for lazy stories that fetch a chunk first.
  await page.waitForFunction(() =>
    ['sb-show-main', 'sb-show-errordisplay', 'sb-show-nopreview'].some((name) =>
      document.body.classList.contains(name),
    ),
  )
  await expect(page.locator('body'), 'Storybook showed its error screen').not.toHaveClass(
    /sb-show-errordisplay|sb-show-nopreview/,
  )
  await page.evaluate(() => document.fonts.ready)
}

/**
 * `test` with a `story` fixture. Every test that uses it fails if the page
 * raised an error, whether or not the test looked for one — a component that
 * throws on click should not pass because the assertion happened to be about
 * something else.
 */
export const test = base.extend<{ story: Story }>({
  // `provide`, not Playwright's usual `use`: the linter reads that name as a React hook.
  story: async ({ page, baseURL }, provide) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const text = message.text()
      if (!IGNORED.some((pattern) => pattern.test(text))) errors.push(text)
    })
    // Hermetic: nothing but the built Storybook is fetched. The font
    // stylesheet is the one outside request, and tests do not depend on it.
    await page.route('**/*', (route) =>
      route.request().url().startsWith(baseURL!) ? route.continue() : route.abort(),
    )

    await provide({
      errors,
      open: async (id, globals = {}) => {
        const set = Object.entries(globals)
          .map(([key, value]) => `${key}:${value}`)
          .join(';')
        await page.goto(`/iframe.html?id=${id}&viewMode=story${set ? `&globals=${set}` : ''}`)
        await waitForStory(page)
        return page.locator('#storybook-root')
      },
    })

    expect(errors, 'the page raised no errors').toEqual([])
  },
})

export { expect }
