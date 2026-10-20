import { expect, test } from '../../../tests/story'

test.describe('RadioGroup', () => {
  test('choosing one releases the other', async ({ story, page }) => {
    await story.open('primitives-radiogroup--vertical')
    const group = page.getByRole('radiogroup', { name: 'Plan' })
    await group.getByRole('radio', { name: 'Enterprise' }).check()
    await expect(group.getByRole('radio', { name: 'Enterprise' })).toBeChecked()
    await expect(group.getByRole('radio', { name: 'Team' })).not.toBeChecked()
  })

  test('the arrow keys move the choice', async ({ story, page }) => {
    await story.open('primitives-radiogroup--horizontal')
    await page.getByRole('radio', { name: 'Team' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('radio', { name: 'Enterprise' })).toBeChecked()
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByRole('radio', { name: 'Team' })).toBeChecked()
  })

  test('a disabled group disables every option', async ({ story, page }) => {
    await story.open('primitives-radiogroup--disabled')
    for (const radio of await page.getByRole('radio').all()) await expect(radio).toBeDisabled()
  })

  test('invalid is reported on the option', async ({ story, page }) => {
    await story.open('primitives-radiogroup--invalid')
    await expect(page.getByRole('radio', { name: 'Invalid option' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
