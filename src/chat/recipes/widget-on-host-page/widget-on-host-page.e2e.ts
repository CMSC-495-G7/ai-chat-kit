import type { Page } from '@playwright/test'
import { expect, test } from '../../../../tests/story'

async function openAndAsk(page: Page, prompt: string) {
  await page.getByRole('button', { name: /Ask Assistant/ }).click()
  await page.clock.runFor(1_000)
  const box = page.getByRole('textbox', { name: 'Message Assistant' })
  await box.fill(prompt)
  await box.press('Enter')
}

test.describe('Widget on a host page over a simulated network', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install()
  })

  test('the widget answers over the wire from inside its shadow root', async ({ story, page }) => {
    await story.open('chat-recipes-widget-on-a-host-page--simulated-network')
    await openAndAsk(page, 'How is the market doing?')
    await page.clock.runFor(20_000)
    await expect(page.getByRole('button', { name: 'get_benchmark_rates' })).toBeVisible()
    await expect(page.getByText('There is no urgency to rebalance.')).toBeVisible()
  })

  test('with no server, the failure stays inside the panel', async ({ story, page }) => {
    await story.open('chat-recipes-widget-on-a-host-page--server-unreachable')
    await openAndAsk(page, 'hello')
    await page.clock.runFor(3_000)
    await expect(page.getByRole('alert')).toContainText(/server not reachable/i)
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    // The host page is untouched.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Quiet counsel')
  })
})

test.describe('Widget on a host page with a custom palette', () => {
  test('the palette crosses the shadow boundary', async ({ story, page }) => {
    await story.open('chat-recipes-widget-on-a-host-page--custom-palette')
    // Playwright's CSS locators pierce open shadow roots.
    const root = page.locator('[data-chat-widget] [data-chat-overlay-root]')
    await expect(root).toHaveClass(/chat-theme-custom/)
    const brand = await root.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--brand-500').trim(),
    )
    expect(brand).toMatch(/^#[0-9a-f]{6}$/)
  })
})

test.describe('Widget greeting on a host page', () => {
  test("with no starters, the empty panel offers today's suggestions", async ({ story, page }) => {
    await story.open('chat-recipes-widget-on-a-host-page--alder-and-finch')
    await page.getByRole('button', { name: /Ask Assistant/ }).click()
    const panel = page.getByRole('dialog', { name: 'Assistant chat' })
    await expect(
      panel.getByRole('heading', { level: 2, name: /What are we working on\?/ }),
    ).toBeVisible()
    const offered = panel.getByRole('region', { name: 'Suggested for today' }).getByRole('button')
    await expect(offered).toHaveCount(3)
  })
})
