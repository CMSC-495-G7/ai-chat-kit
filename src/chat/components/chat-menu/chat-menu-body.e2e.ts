import { expect, test } from '../../../../tests/story'

test.describe('ChatMenuBody', () => {
  test('New chat comes first, then search, and Recent counts the history', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-chat-menu-body--in-the-panel')
    await expect(page.getByRole('button', { name: 'New chat' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Search chat' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Recent/ })).toBeVisible()
  })

  test('Recent opens to the conversations, newest first', async ({ story, page }) => {
    await story.open('chat-components-chat-menu-body--in-the-panel')
    await page.getByRole('button', { name: /^Recent/ }).click()
    await expect(page.getByRole('button', { name: 'Positive pay exceptions' })).toBeVisible()
  })

  test('with no history there is nothing to list', async ({ story, page }) => {
    await story.open('chat-components-chat-menu-body--no-history')
    await expect(page.getByRole('button', { name: /^Recent/ })).toContainText('0')
  })
})
