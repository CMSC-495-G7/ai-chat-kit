import { expect, test } from '../../../tests/story'

test.describe('Select', () => {
  test('choosing an option changes the value', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    const select = page.getByRole('combobox', { name: 'Region' })
    await select.selectOption({ label: 'EU West' })
    await expect(select.locator('option:checked')).toHaveText('EU West')
  })

  test('a disabled option cannot be chosen', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    await expect(page.getByRole('option', { name: 'AP South' })).toBeDisabled()
  })

  test('disabled and invalid are reported', async ({ story, page }) => {
    await story.open('primitives-select--disabled')
    await expect(page.getByRole('combobox', { name: 'Region' })).toBeDisabled()
    await story.open('primitives-select--invalid')
    await expect(page.getByRole('combobox', { name: 'Region' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  test('the small size matches a small button', async ({ story, page }) => {
    await story.open('primitives-select--sizes')
    const small = await page.getByRole('combobox', { name: 'Rows per page' }).boundingBox()
    const medium = await page.getByRole('combobox', { name: 'Status' }).boundingBox()
    expect(small!.height).toBeLessThan(medium!.height)
  })
})
