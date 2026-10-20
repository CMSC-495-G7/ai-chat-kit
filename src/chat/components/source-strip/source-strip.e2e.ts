import { expect, test } from '../../../../tests/story'

test.describe('SourceStrip', () => {
  test('each source is a numbered button', async ({ story, page }) => {
    await story.open('chat-components-sourcestrip--default')
    await expect(
      page.getByRole('button', { name: '1 Treasury liquidity policy (2026)' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: '3 Wire approval runbook' })).toBeVisible()
  })

  test('a source with a file also links to the original', async ({ story, page }) => {
    await story.open('chat-components-sourcestrip--default')
    await expect(
      page.getByRole('link', { name: 'Open original document: Treasury liquidity policy (2026)' }),
    ).toHaveAttribute('href', /liquidity-2026\.pdf$/)
  })

  test('past eight it folds the rest behind a count, and shows them on request', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-sourcestrip--many')
    await expect(page.getByRole('button', { name: /^\d+ Working paper/ })).toHaveCount(8)
    await page.getByRole('button', { name: '+6 more' }).click()
    await expect(page.getByRole('button', { name: /^\d+ Working paper/ })).toHaveCount(14)
  })

  test('a long title is cut inside its pill', async ({ story, page }) => {
    await story.open('chat-components-sourcestrip--long-titles')
    const pill = page.getByRole('button', { name: /^1 Liquidity policy/ })
    expect((await pill.boundingBox())!.height).toBeLessThan(40)
  })
})
