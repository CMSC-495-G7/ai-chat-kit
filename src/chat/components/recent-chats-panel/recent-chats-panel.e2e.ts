import { expect, test } from '../../../../tests/story'

test.describe('RecentChatsPanel', () => {
  test('each conversation is a button, with the open one marked current', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-recentchatspanel--default')
    await expect(page.getByRole('button')).toHaveCount(4)
    await expect(page.locator('[aria-current="true"]')).toContainText('Monthly liquidity position')
  })

  test('choosing another moves the mark', async ({ story, page }) => {
    await story.open('chat-components-recentchatspanel--default')
    await page.getByRole('button', { name: /^Q3 vendor run forecast/ }).click()
    await expect(page.locator('[aria-current="true"]')).toContainText('Q3 vendor run forecast')
    await expect(page.locator('[aria-current="true"]')).toHaveCount(1)
  })

  test('long titles are cut to one line so every row is the same height', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-recentchatspanel--long-titles')
    const heights = await page
      .getByRole('button')
      .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
    expect(new Set(heights).size).toBe(1)
  })

  test('with no conversations it draws nothing', async ({ story, page }) => {
    await story.open('chat-components-recentchatspanel--empty')
    await expect(page.getByRole('button')).toHaveCount(0)
  })
})
