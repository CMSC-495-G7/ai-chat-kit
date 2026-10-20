import { expect, test } from '../../../tests/story'

test.describe('DateField', () => {
  test('it shows the date in words and is named by its label', async ({ story, page }) => {
    await story.open('primitives-datefield--default')
    await expect(page.getByRole('textbox', { name: 'Renewal date' })).toHaveValue('Sep 18, 2026')
  })

  test('the calendar opens from its button and closes on Escape', async ({ story, page }) => {
    await story.open('primitives-datefield--default')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const calendar = page.getByRole('dialog')
    await expect(calendar).toBeVisible()
    // The calendar loads on first open and takes focus, on the selected day, once it has.
    await expect(page.getByRole('gridcell', { name: /September 18th, 2026/ })).toBeFocused({
      timeout: 15_000,
    })
    await page.keyboard.press('Escape')
    await expect(calendar).toBeHidden()
    await expect(page.getByRole('textbox', { name: 'Renewal date' })).toBeFocused()
  })

  test('a typed date is accepted when the field is left', async ({ story, page }) => {
    await story.open('primitives-datefield--empty')
    const field = page.getByRole('textbox', { name: 'Renewal date' })
    await field.fill('Mar 3, 2027')
    await field.blur()
    await expect(field).toHaveValue('Mar 3, 2027')
    await expect(field).not.toHaveAttribute('aria-invalid', 'true')
  })

  test('a date that does not exist is flagged rather than silently changed', async ({
    story,
    page,
  }) => {
    await story.open('primitives-datefield--typing-help')
    const field = page.getByRole('textbox', { name: 'Renewal date' })
    await field.fill('Feb 30, 2027')
    await field.blur()
    await expect(field).toHaveAttribute('aria-invalid', 'true')
  })

  test('an error is tied to the field', async ({ story, page }) => {
    await story.open('primitives-datefield--with-error')
    const field = page.getByRole('textbox', { name: 'Renewal date' })
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toHaveAccessibleDescription(/Renewal must be after the start date/)
  })

  test('disabled disables the field and its calendar button together', async ({ story, page }) => {
    await story.open('primitives-datefield--disabled')
    await expect(page.getByRole('textbox', { name: 'Renewal date' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Open calendar' })).toBeDisabled()
  })
})
