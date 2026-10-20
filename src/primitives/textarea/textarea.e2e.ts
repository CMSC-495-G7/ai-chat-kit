import { expect, test } from '../../../tests/story'

test.describe('Textarea', () => {
  test('it takes several lines', async ({ story, page }) => {
    await story.open('primitives-textarea--playground')
    const area = page.getByRole('textbox', { name: 'Instructions' })
    await area.fill('Line one\nLine two')
    await expect(area).toHaveValue('Line one\nLine two')
  })

  test('read-only text can be selected but not changed', async ({ story, page }) => {
    await story.open('primitives-textarea--read-only')
    const area = page.getByRole('textbox', { name: 'Instructions' })
    await expect(area).toHaveAttribute('readonly', '')
    await area.focus()
    await page.keyboard.type('x')
    await expect(area).toHaveValue('Read-only notes')
  })

  test('invalid and disabled are reported', async ({ story, page }) => {
    await story.open('primitives-textarea--invalid')
    await expect(page.getByRole('textbox', { name: 'Instructions' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await story.open('primitives-textarea--disabled')
    await expect(page.getByRole('textbox', { name: 'Instructions' })).toBeDisabled()
  })
})
