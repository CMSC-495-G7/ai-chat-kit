import { expect, test } from '../../../tests/story'

test.describe('SlideOver', () => {
  test('it opens as a modal dialog and moves focus into itself', async ({ story, page }) => {
    await story.open('components-slide-over--opened-from-a-button')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const panel = page.getByRole('dialog', { name: 'Menu' })
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await expect(panel.getByRole('link', { name: 'Home' })).toBeFocused()
  })

  test('Tab is kept inside it', async ({ story, page }) => {
    await story.open('components-slide-over--opened-from-a-button')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const panel = page.getByRole('dialog', { name: 'Menu' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(panel.getByRole('link', { name: 'Chat' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(panel.getByRole('link', { name: 'Home' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(panel.getByRole('link', { name: 'Chat' })).toBeFocused()
  })

  test('Escape closes it and focus returns to the control that opened it', async ({
    story,
    page,
  }) => {
    await story.open('components-slide-over--opened-from-a-button')
    const trigger = page.getByRole('button', { name: 'Open menu' })
    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('the scrim is a button that closes it', async ({ story, page }) => {
    await story.open('components-slide-over--opened-from-a-button')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('button', { name: 'Close menu' }).click({ position: { x: 600, y: 200 } })
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('it can come from either side', async ({ story, page }) => {
    const root = await story.open('components-slide-over--from-the-right')
    const frame = (await root.locator('.relative').first().boundingBox())!
    const panel = (await page.getByRole('dialog', { name: 'References' }).boundingBox())!
    expect(Math.abs(panel.x + panel.width - (frame.x + frame.width))).toBeLessThan(2)
  })
})
