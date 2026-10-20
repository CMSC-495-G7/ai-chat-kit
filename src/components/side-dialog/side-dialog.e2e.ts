import { expect, test } from '../../../tests/story'

test.describe('SideDialog', () => {
  test('it opens as a dialog named by its title', async ({ story, page }) => {
    await story.open('components-side-dialog--opened-from-a-button')
    await page.getByRole('button', { name: 'Open feature toggles' }).click()
    const dialog = page.getByRole('dialog', { name: 'Feature toggles' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Choose what a response shows.')
  })

  test('Escape closes it and focus returns to the control that opened it', async ({
    story,
    page,
  }) => {
    await story.open('components-side-dialog--opened-from-a-button')
    const trigger = page.getByRole('button', { name: 'Open feature toggles' })
    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('the close button, and a click on the scrim, both close it', async ({ story, page }) => {
    await story.open('components-side-dialog--opened-from-a-button')
    const trigger = page.getByRole('button', { name: 'Open feature toggles' })
    await trigger.click()
    await page.getByRole('button', { name: 'Close feature toggles' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await trigger.click()
    await page.mouse.click(40, 40)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('controls inside it work while it is open', async ({ story, page }) => {
    await story.open('components-side-dialog--opened-from-a-button')
    await page.getByRole('button', { name: 'Open feature toggles' }).click()
    const toggle = page.getByRole('switch', { name: 'Show sources' })
    await toggle.click()
    await expect(toggle).not.toBeChecked()
    await page.getByRole('button', { name: 'Reset to defaults' }).click()
    await expect(toggle).toBeChecked()
  })

  test('it sits against the right edge so the page it changes stays in view', async ({
    story,
    page,
  }) => {
    await story.open('components-side-dialog--default')
    const box = (await page.getByRole('dialog').locator('> *').first().boundingBox())!
    expect(box.x + box.width).toBeGreaterThan(1280 - 40)
    expect(box.x).toBeGreaterThan(640)
  })

  test('a long body scrolls inside while the footer stays put', async ({ story, page }) => {
    await story.open('components-side-dialog--scrolling-body')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Showing 30 entries')).toBeInViewport()
    await expect(dialog.getByText('Entry 30:')).not.toBeInViewport()
  })
})
