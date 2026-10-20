import { expect, test } from '../../../tests/story'

test.describe('Tooltip', () => {
  test('hovering shows it and leaving hides it', async ({ story, page }) => {
    await story.open('primitives-tooltip--playground')
    await page.getByRole('button', { name: 'Run log' }).hover()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.mouse.move(900, 700)
    await expect(page.getByRole('tooltip')).toBeHidden()
  })

  test('keyboard focus shows it, and Escape dismisses it without moving focus', async ({
    story,
    page,
  }) => {
    await story.open('primitives-tooltip--playground')
    const button = page.getByRole('button', { name: 'Run log' })
    await button.focus()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('disabled shows nothing', async ({ story, page }) => {
    await story.open('primitives-tooltip--disabled')
    await page.getByRole('button', { name: 'Run log' }).hover()
    await page.waitForTimeout(600)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
  })

  test('it escapes a container that clips its trigger', async ({ story, page }) => {
    await story.open('primitives-tooltip--inside-clipping-container')
    await page.getByRole('button', { name: 'Delete' }).hover()
    const tip = page.getByRole('tooltip')
    await expect(tip).toHaveText('Delete this tenant and every workspace in it')
    const box = (await tip.boundingBox())!
    // Fully on screen: nothing cut off by the clipping ancestor.
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.width).toBeGreaterThan(120)
  })

  test('placement can be below the trigger', async ({ story, page }) => {
    await story.open('primitives-tooltip--bottom')
    const button = page.getByRole('button', { name: 'Run log' })
    await button.hover()
    const [anchor, tip] = [
      (await button.boundingBox())!,
      (await page.getByRole('tooltip').boundingBox())!,
    ]
    expect(tip.y).toBeGreaterThan(anchor.y + anchor.height - 1)
  })
})
