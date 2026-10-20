import { expect, test } from '../../../tests/story'

test.describe('Alert', () => {
  test('only the danger tone interrupts: it is an alert, the rest are status', async ({
    story,
    page,
  }) => {
    await story.open('primitives-alert--tones')
    await expect(page.getByRole('alert')).toHaveCount(1)
    await expect(page.getByRole('alert')).toContainText('The import could not be completed')
    await expect(page.getByRole('status')).toHaveCount(3)
  })

  test('dismissing removes it', async ({ story, page }) => {
    await story.open('primitives-alert--dismissible')
    await page.getByRole('button', { name: 'Dismiss citation shortcut notice' }).click()
    await expect(page.getByText('Citation shortcuts are available')).toBeHidden()
  })

  test('a list of problems is a real list', async ({ story, page }) => {
    await story.open('primitives-alert--with-items')
    await expect(page.getByRole('alert').getByRole('listitem')).toHaveCount(3)
  })

  test('technical details stay folded until asked for', async ({ story, page }) => {
    await story.open('primitives-alert--action-and-details')
    const details = page.locator('details')
    await expect(details).not.toHaveAttribute('open', '')
    await page.getByText('Show API response').click()
    await expect(details).toHaveAttribute('open', '')
  })

  test('actions are buttons a keyboard can reach', async ({ story, page }) => {
    await story.open('primitives-alert--inline-banner')
    await page.getByRole('button', { name: 'Pay invoice' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Contact billing' })).toBeFocused()
  })
})
