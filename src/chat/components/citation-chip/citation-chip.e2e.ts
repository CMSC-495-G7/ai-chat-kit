import { expect, test } from '../../../../tests/story'

test.describe('CitationChip', () => {
  test('it is a button that names the reference it opens', async ({ story, page }) => {
    await story.open('chat-components-citationchip--chip')
    await expect(page.getByRole('button', { name: 'Open reference 1' })).toHaveText('1')
  })

  test('hovering a chip in prose previews the source', async ({ story, page }) => {
    await story.open('chat-components-citationchip--in-prose-with-preview')
    await page.getByRole('button', { name: 'Open reference 1' }).hover()
    await expect(page.getByText('Treasury liquidity policy (2026)', { exact: true })).toBeVisible()
  })

  test('the preview stays open while the pointer is on it', async ({ story, page }) => {
    await story.open('chat-components-citationchip--in-prose-with-preview')
    await page.getByRole('button', { name: 'Open reference 1' }).hover()
    const title = page.getByText('Treasury liquidity policy (2026)', { exact: true })
    await title.hover()
    await page.waitForTimeout(400)
    await expect(title).toBeVisible()
  })

  test('the preview marks the cited passages and links to the original', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-components-citationchip--preview-card')
    await expect(root.locator('mark')).toHaveText([
      'at least 30 days',
      /escalated to the treasurer/,
    ])
    await expect(page.getByRole('link', { name: 'Open original' })).toHaveAttribute(
      'href',
      /liquidity-2026\.pdf$/,
    )
  })
})
