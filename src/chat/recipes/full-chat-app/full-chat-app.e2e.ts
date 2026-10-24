import type { Page } from '@playwright/test'
import { expect, test } from '../../../../tests/story'

async function ask(page: Page, prompt: string) {
  const box = page.getByRole('textbox', { name: 'Message Assistant' })
  await box.fill(prompt)
  await box.press('Enter')
}

test.describe('Full chat app over a simulated network', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install()
  })

  test('answers over the wire, with tool calls and the trace', async ({ story, page }) => {
    const root = await story.open('chat-recipes-full-chat-app--simulated-network')
    await ask(page, 'How is the market doing?')
    await page.clock.runFor(20_000)
    await expect(page.getByRole('button', { name: 'get_benchmark_rates' })).toBeVisible()
    await expect(root).toContainText('demo-sim · 412 tokens')
  })

  test('with no server, the turn fails in place and the app stays usable', async ({
    story,
    page,
  }) => {
    await story.open('chat-recipes-full-chat-app--server-unreachable')
    await ask(page, 'hello')
    await page.clock.runFor(3_000)
    await expect(page.getByRole('alert')).toContainText(/server not reachable/i)
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Message Assistant' })).toBeEnabled()
  })
})

test.describe('Full chat app on canned turns', () => {
  test('a reference that is a knowledge article opens as an article', async ({ story, page }) => {
    await page.clock.install()
    await story.open('chat-recipes-full-chat-app--default')
    // The article is cited by the second canned answer.
    await ask(page, 'How big should my emergency fund be?')
    await page.clock.runFor(60_000)
    await ask(page, 'Help me make a plan')
    await page.clock.runFor(60_000)
    await page
      .getByRole('button', { name: /Anatomy of a Financial Plan/ })
      .first()
      .click()
    await page.getByRole('tab', { name: 'Original' }).click()
    await expect(page.getByRole('group', { name: /^Article: / }).getByRole('article')).toBeVisible()
    // An article is one sheet: zoom is offered, a page count is not.
    await expect(page.getByText(/Page \d+ of \d+/)).toHaveCount(0)
  })
})

test.describe('Full chat app in the side menu', () => {
  test('the chat adds its New chat and history to the rail’s panel', async ({ story, page }) => {
    await story.open('chat-recipes-full-chat-app--in-side-menu')
    const panel = page.getByRole('complementary', { name: 'Chat' })
    await expect(page.getByRole('navigation', { name: 'Apps' })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'New chat' })).toBeVisible()
  })

  test('on a phone the rail opens over the page from a button', async ({ story, page }) => {
    await page.setViewportSize({ width: 390, height: 780 })
    await story.open('chat-recipes-full-chat-app--in-side-menu')
    await expect(page.getByRole('navigation', { name: 'Apps' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('navigation', { name: 'Apps' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'New chat' })).toBeVisible()
  })
})
