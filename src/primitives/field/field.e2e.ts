import { expect, test } from '../../../tests/story'

test.describe('Field', () => {
  test('clicking the label focuses its control', async ({ story, page }) => {
    await story.open('primitives-field--with-description')
    await page.getByText('Project name', { exact: true }).click()
    await expect(page.getByRole('textbox', { name: 'Project name' })).toBeFocused()
  })

  test('the description describes the control', async ({ story, page }) => {
    await story.open('primitives-field--with-description')
    await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveAccessibleDescription(
      'Used in the workspace navigation and audit log.',
    )
  })

  test('an error marks the control invalid and is announced', async ({ story, page }) => {
    await story.open('primitives-field--with-error')
    const input = page.getByRole('textbox', { name: 'API key' })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toHaveText('Use a key beginning with sk-.')
    await expect(input).toHaveAccessibleDescription(/Use a key beginning with sk-/)
  })

  test('a whole form can be walked with Tab, in order', async ({ story, page }) => {
    await story.open('primitives-field--form-composition')
    await page.getByRole('textbox', { name: 'Project name' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Instructions' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('combobox', { name: 'Region' })).toBeFocused()
  })
})
