import { expect, test } from '../../../tests/story'

test.describe('HoverCard', () => {
  const card = 'text=2025 financial statements · p. 4'

  test('hovering the anchor opens it, and leaving closes it', async ({ story, page }) => {
    await story.open('primitives-hovercard--citation')
    await page.getByRole('button', { name: '[2]' }).hover()
    await expect(page.locator(card)).toBeVisible()
    await page.mouse.move(5, 700)
    await expect(page.locator(card)).toBeHidden()
  })

  test('it stays open while the pointer is on the card itself', async ({ story, page }) => {
    await story.open('primitives-hovercard--citation')
    await page.getByRole('button', { name: '[2]' }).hover()
    await page.locator(card).hover()
    await page.waitForTimeout(400)
    await expect(page.locator(card)).toBeVisible()
  })

  test('keyboard focus opens it too', async ({ story, page }) => {
    await story.open('primitives-hovercard--citation')
    await page.getByRole('button', { name: '[2]' }).focus()
    await expect(page.locator(card)).toBeVisible()
  })

  test('it sits above the anchor, and flips below when there is no room', async ({
    story,
    page,
  }) => {
    const gap = async () => {
      await page.getByRole('button', { name: '[2]' }).hover()
      await expect(page.locator(card)).toBeVisible()
      const [anchor, body] = await Promise.all([
        page.getByRole('button', { name: '[2]' }).boundingBox(),
        page.locator(card).boundingBox(),
      ])
      return body!.y - anchor!.y
    }
    await story.open('primitives-hovercard--above-when-there-is-room')
    expect(await gap()).toBeLessThan(0)
    await story.open('primitives-hovercard--citation')
    expect(await gap()).toBeGreaterThan(0)
  })
})
