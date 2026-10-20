import { expect, test } from '../../../../tests/story'

test.describe('MessageActions', () => {
  test('always-on, the row is visible and clickable', async ({ story, page }) => {
    await story.open('chat-components-messageactions--always-shown')
    await expect(page.getByRole('button', { name: 'Regenerate' })).toBeVisible()
  })

  test('with reveal, it is invisible until the turn is hovered', async ({ story }) => {
    const root = await story.open('chat-components-messageactions--reveal-on-hover')
    const row = root.locator('.message-actions')
    await expect(row).toHaveCSS('opacity', '0')
    await expect(row).toHaveCSS('pointer-events', 'none')
    await root.getByText('Hover this turn to reveal its actions.').hover()
    await expect(row).toHaveCSS('opacity', '1')
    await expect(row).toHaveCSS('pointer-events', 'auto')
  })

  test('keyboard focus reveals it too, so it is never a mouse-only control', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-components-messageactions--reveal-on-hover')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Copy' })).toBeFocused()
    await expect(root.locator('.message-actions')).toHaveCSS('opacity', '1')
  })

  test('hidden or shown, it keeps its place so the transcript does not jump', async ({ story }) => {
    const root = await story.open('chat-components-messageactions--reveal-on-hover')
    const turn = root.locator('.group\\/turn')
    const before = (await turn.boundingBox())!.height
    await turn.hover()
    expect((await turn.boundingBox())!.height).toBe(before)
  })
})
