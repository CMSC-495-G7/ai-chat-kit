import { expect, test } from '../../../tests/story'

test.describe('Modal', () => {
  test('it opens as a named dialog and Escape closes it', async ({ story, page }) => {
    await story.open('primitives-modal--playground')
    await page.getByRole('button', { name: 'Open modal' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create workspace' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('focus returns to the control that opened it', async ({ story, page }) => {
    await story.open('primitives-modal--playground')
    const trigger = page.getByRole('button', { name: 'Open modal' })
    await trigger.click()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
    await expect(trigger).toBeFocused()
  })

  test('Tab stays inside the dialog', async ({ story, page }) => {
    await story.open('primitives-modal--playground')
    await page.getByRole('button', { name: 'Open modal' }).click()
    const dialog = page.getByRole('dialog')
    // A native modal dialog makes the page behind it inert: Tab can leave for
    // the browser's own chrome, but never lands on anything underneath.
    for (let press = 0; press < 12; press++) {
      await page.keyboard.press('Tab')
      const where = await dialog.evaluate((node) =>
        node.contains(document.activeElement) ? 'dialog' : document.activeElement?.tagName,
      )
      expect(['dialog', 'BODY']).toContain(where)
    }
  })

  test('initial focus can be sent to a field', async ({ story, page }) => {
    await story.open('primitives-modal--form-with-initial-focus')
    await page.getByRole('button', { name: 'Create workspace' }).click()
    await expect(page.getByRole('dialog').getByRole('textbox').first()).toBeFocused()
  })

  test('a destructive confirmation names what it deletes and offers a way back', async ({
    story,
    page,
  }) => {
    await story.open('primitives-modal--destructive-confirm')
    await page.getByRole('button', { name: 'Delete tenant' }).click()
    const dialog = page.getByRole('dialog', { name: 'Delete Crestview Health?' })
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Delete tenant' })).toBeVisible()
  })

  test('each size opens', async ({ story, page }) => {
    await story.open('primitives-modal--sizes')
    const widths: number[] = []
    for (const size of ['sm', 'md', 'lg']) {
      await page.getByRole('button', { name: `Open ${size}` }).click()
      // The dialog element spans the viewport; the surface inside it is what has a size.
      widths.push((await page.locator('dialog[open] > *').first().boundingBox())!.width)
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toBeHidden()
    }
    expect(widths[0]).toBeLessThan(widths[1])
    expect(widths[1]).toBeLessThan(widths[2])
  })
})
