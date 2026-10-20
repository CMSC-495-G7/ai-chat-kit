import { expect, test } from '../../../tests/story'

test.describe('SearchField', () => {
  test('its label names it even though the label is not shown', async ({ story, page }) => {
    await story.open('primitives-search-field--default')
    await expect(page.getByRole('textbox', { name: 'Find a tenant' })).toBeVisible()
  })

  test('clicking anywhere on the field, icon included, focuses the input', async ({
    story,
    page,
  }) => {
    const root = await story.open('primitives-search-field--default')
    await root.locator('svg').first().click()
    await expect(page.getByRole('textbox', { name: 'Find a tenant' })).toBeFocused()
  })

  test('typing reaches the host, which filters as it sees fit', async ({ story, page }) => {
    const root = await story.open('primitives-search-field--filtering-a-list')
    await expect(root.getByRole('listitem')).toHaveCount(5)
    await page.getByRole('textbox', { name: 'Find a tenant' }).fill('alder')
    await expect(root.getByRole('listitem')).toHaveText([
      'Alderfinch Treasury',
      'Alderfinch Retail',
    ])
    await page.getByRole('textbox', { name: 'Find a tenant' }).fill('zzz')
    await expect(root.getByText('No tenant matches “zzz”.')).toBeVisible()
  })

  test('disabled is disabled', async ({ story, page }) => {
    await story.open('primitives-search-field--disabled')
    await expect(page.getByRole('textbox', { name: 'Find a tenant' })).toBeDisabled()
  })
})
