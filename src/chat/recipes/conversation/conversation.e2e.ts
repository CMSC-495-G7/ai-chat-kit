import type { Page } from '@playwright/test'
import { expect, test } from '../../../../tests/story'

// The network stories run the real WebSocket responder against a simulated
// server, on timers. The clock is installed before the story loads, so each
// test decides how much time passes.
async function ask(page: Page, prompt: string) {
  const box = page.getByRole('textbox', { name: 'Message Assistant' })
  await box.fill(prompt)
  await box.press('Enter')
}

const unreachable = /server not reachable/i

test.describe('Conversation over a simulated network', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install()
  })

  test('each story says what its network will do', async ({ story }) => {
    const root = await story.open('chat-recipes-conversation--server-unreachable')
    await expect(root).toContainText('Every connection is refused')
  })

  test('a healthy server streams tool calls, then the answer and its trace', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-recipes-conversation--healthy-server')
    await ask(page, 'How is the market doing?')

    await page.clock.runFor(2_000)
    await expect(page.getByRole('button', { name: 'get_benchmark_rates' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Stop response' })).toBeVisible()

    await page.clock.runFor(18_000)
    await expect(page.getByRole('button', { name: 'market_snapshot' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'get_account_allocation' })).toBeVisible()
    await expect(root).toContainText('There is no urgency to rebalance.')
    // The model and token count only exist on the wire's closing summary.
    await expect(root).toContainText('demo-sim · 412 tokens')
    await expect(
      page.getByRole('button', { name: 'What would moving the cash into bonds change?' }),
    ).toBeVisible()
  })

  test('a tool that fails is shown with its reason, and the answer still arrives', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-recipes-conversation--healthy-server')
    await ask(page, 'Give me a quote')
    await page.clock.runFor(15_000)
    await expect(root).toContainText('Upstream timed out after 5s')
    await expect(root).toContainText('AGG finished at $98.42')
    await expect(page.getByRole('button', { name: /recovered/ })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('problems the server reports with the answer land on the trace', async ({ story, page }) => {
    const root = await story.open('chat-recipes-conversation--healthy-server')
    await ask(page, 'show me a degraded answer')
    await page.clock.runFor(15_000)
    await expect(root).toContainText('45 days')
    await expect(root).toContainText('Search fell back to the secondary index')
    await expect(root).toContainText('Results were not reranked')
  })

  test('a server that gives up mid-answer leaves the partial answer and a Retry', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-recipes-conversation--healthy-server')
    await ask(page, 'make an error')
    await page.clock.runFor(12_000)
    await expect(root).toContainText('Available cash covers roughly 68 days')
    await expect(page.getByRole('alert')).toContainText('The model stopped responding.')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('a slow connection waits, can be stopped, and gets there in the end', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-recipes-conversation--slow-connection')
    await ask(page, 'hello')

    // Still connecting: nothing has arrived, and the turn can be stopped.
    await page.clock.runFor(2_000)
    await expect(page.getByRole('button', { name: 'Stop response' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Thought for/ })).toHaveCount(0)

    await page.clock.runFor(120_000)
    await expect(page.getByRole('button', { name: /^Thought for/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy response' })).toBeVisible()
    await expect(root).not.toContainText(unreachable)
  })

  test('an unreachable server fails the turn, and Retry fails again', async ({ story, page }) => {
    await story.open('chat-recipes-conversation--server-unreachable')
    await ask(page, 'hello')
    await page.clock.runFor(3_000)
    await expect(page.getByRole('alert')).toContainText(unreachable)

    await page.getByRole('button', { name: 'Retry' }).click()
    await page.clock.runFor(3_000)
    await expect(page.getByRole('alert')).toContainText(unreachable)
    await expect(page.getByRole('button', { name: 'Copy response' })).toHaveCount(0)
  })

  test('Retry gets through when the second connection is accepted', async ({ story, page }) => {
    await story.open('chat-recipes-conversation--retry-succeeds')
    await ask(page, 'hello')
    await page.clock.runFor(3_000)
    await expect(page.getByRole('alert')).toContainText(unreachable)

    await page.getByRole('button', { name: 'Retry' }).click()
    await page.clock.runFor(30_000)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Copy response' })).toBeVisible()
  })

  test('a dropped connection keeps what had arrived and frees the composer', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-recipes-conversation--connection-drops')
    await ask(page, 'hello')
    await page.clock.runFor(20_000)
    await expect(root).toContainText('Here is a straightforward way to think about it.')
    // Nothing after the drop: the closing summary carries the follow-ups.
    await expect(page.getByRole('list', { name: 'Suggested follow-ups' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Stop response' })).toHaveCount(0)
  })
})

test.describe('Conversation', () => {
  test('the canned story answers without a socket', async ({ story, page }) => {
    await page.clock.install()
    await story.open('chat-recipes-conversation--live')
    await ask(page, 'hello')
    await page.clock.runFor(60_000)
    await expect(page.getByRole('button', { name: 'Copy response' })).toBeVisible()
  })
})
