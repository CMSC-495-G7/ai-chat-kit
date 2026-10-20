import { expect, test } from '../../../../tests/story'

test.describe('ChatMenu', () => {
  test('it is a named complementary region with New chat first', async ({ story, page }) => {
    await story.open('chat-components-chat-menu--expanded')
    const menu = page.getByRole('complementary', { name: 'Chat menu' })
    await expect(menu.getByRole('button', { name: 'New chat' })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Search chat' })).toBeVisible()
  })

  test('collapsed, it is a narrow rail whose controls keep their names', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-chat-menu--rail')
    const menu = page.getByRole('complementary', { name: 'Chat menu' })
    expect((await menu.boundingBox())!.width).toBeLessThan(100)
    for (const name of ['Expand sidebar', 'New chat', 'Search chat', 'Filters']) {
      await expect(menu.getByRole('button', { name })).toBeVisible()
    }
  })

  test('its edge is a separator the arrow keys can move', async ({ story, page }) => {
    await story.open('chat-components-chat-menu--expanded')
    const menu = page.getByRole('complementary', { name: 'Chat menu' })
    const handle = page.getByRole('separator', { name: 'Resize the chat menu' })
    const before = (await menu.boundingBox())!.width
    await handle.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => (await menu.boundingBox())!.width).toBeGreaterThan(before)
    await expect(handle).toHaveAttribute('aria-valuenow', String(Math.round(before) + 16))
    await page.evaluate(() => localStorage.clear())
  })

  test('recent chats are folded until asked for', async ({ story, page }) => {
    await story.open('chat-components-chat-menu--expanded')
    const recent = page.getByRole('button', { name: /^Recent/ })
    await expect(recent).toHaveAttribute('aria-expanded', 'false')
    await recent.click()
    await expect(recent).toHaveAttribute('aria-expanded', 'true')
  })

  test('embedded in the shell it drops the brand and the account menu', async ({ story, page }) => {
    await story.open('chat-components-chat-menu--embedded')
    const menu = page.getByRole('complementary', { name: 'Chat menu' })
    await expect(menu.getByRole('button', { name: /^Account:/ })).toHaveCount(0)
    await expect(menu).toContainText('Chat')
  })
})
