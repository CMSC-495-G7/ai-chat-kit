import { expect, test } from '../../../tests/story'

test.describe('InlineTip', () => {
  test('it is a note, not an alert: it never interrupts', async ({ story, page }) => {
    await story.open('primitives-inlinetip--playground')
    await expect(page.getByRole('note')).toContainText('Select any numbered citation')
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('dismissing removes it', async ({ story, page }) => {
    await story.open('primitives-inlinetip--dismissible')
    await page.getByRole('button', { name: 'Dismiss citation tip' }).click()
    await expect(page.getByRole('note')).toBeHidden()
  })

  test('without an icon it is still a note with the same words', async ({ story, page }) => {
    await story.open('primitives-inlinetip--without-icon')
    await expect(page.getByRole('note')).toHaveText(
      'Select any numbered citation to open its original source.',
    )
  })
})
