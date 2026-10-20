import { expect, test } from '../../../tests/story'

test.describe('Notice', () => {
  test('only the error tone is an alert', async ({ story, page }) => {
    await story.open('primitives-notice--tones')
    await expect(page.getByRole('status')).toHaveCount(3)
    await expect(page.getByRole('alert')).toHaveText(/Sign-in with Okta is failing/)
  })

  test('the label says the state in words, not only in colour', async ({ story, page }) => {
    await story.open('primitives-notice--tones')
    for (const word of ['Info', 'Success', 'Warning', 'Error']) {
      await expect(page.getByText(word, { exact: true })).toBeVisible()
    }
  })

  test('dismissing removes it', async ({ story, page }) => {
    await story.open('primitives-notice--dismissible')
    await page.getByRole('button', { name: 'Dismiss saved notice' }).click()
    await expect(page.getByText('Retention changed to 18 months')).toBeHidden()
  })

  test('its action is a button inside the notice', async ({ story, page }) => {
    await story.open('primitives-notice--with-action')
    await expect(page.getByRole('alert').getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('the tip variant is a note', async ({ story, page }) => {
    await story.open('primitives-notice--tip')
    await expect(page.getByRole('note')).toContainText('Select any numbered citation')
  })
})
