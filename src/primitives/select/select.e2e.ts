import { expect, test } from '../../../tests/story'

test.describe('Select', () => {
  test('choosing an option with the pointer changes the value', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    const select = page.getByRole('combobox', { name: 'Region' })
    await select.click()
    await expect(select).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('option', { name: 'EU West' }).click()
    await expect(select).toHaveText('EU West')
    await expect(select).toHaveAttribute('aria-expanded', 'false')
    await expect(select).toBeFocused()
  })

  test('the keyboard opens, moves, chooses and closes', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    const select = page.getByRole('combobox', { name: 'Region' })
    await select.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('listbox', { name: 'Region' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'US East' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    const active = await select.getAttribute('aria-activedescendant')
    await expect(page.locator(`[id="${active}"]`)).toHaveText('EU West')
    // AP South is disabled, so the end of the list is EU West.
    await page.keyboard.press('ArrowDown')
    await expect(select).toHaveAttribute('aria-activedescendant', active!)
    await page.keyboard.press('Enter')
    await expect(select).toHaveText('EU West')
    await expect(page.getByRole('listbox')).toHaveCount(0)

    await page.keyboard.press('Space')
    await expect(page.getByRole('listbox')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await expect(select).toHaveText('EU West')
  })

  test('typing jumps to the matching option', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    const select = page.getByRole('combobox', { name: 'Region' })
    await select.focus()
    await page.keyboard.type('us w')
    await page.keyboard.press('Enter')
    await expect(select).toHaveText('US West')
  })

  test('a disabled option cannot be chosen', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    const select = page.getByRole('combobox', { name: 'Region' })
    await select.click()
    const option = page.getByRole('option', { name: 'AP South' })
    await expect(option).toHaveAttribute('aria-disabled', 'true')
    await option.click({ force: true })
    await expect(select).toHaveText('US East')
  })

  test('a press outside closes the list', async ({ story, page }) => {
    await story.open('primitives-select--playground')
    await page.getByRole('combobox', { name: 'Region' }).click()
    await page.mouse.click(5, 5)
    await expect(page.getByRole('listbox')).toHaveCount(0)
  })

  test('the label action and the list action both run', async ({ story, page }) => {
    await story.open('primitives-select--with-actions')
    const select = page.getByRole('combobox', { name: 'Client' })
    await expect(select).toHaveText('Casa Lumen')

    await page.getByRole('button', { name: 'New client' }).click()
    await expect(select).toHaveText('Nuevo Cliente')

    await select.click()
    await page.getByRole('option', { name: 'Import clients' }).click()
    await expect(select).toHaveText('Imported Co.')

    // The list action is the last stop for the keyboard too.
    await select.focus()
    await page.keyboard.press('End')
    const active = await select.getAttribute('aria-activedescendant')
    await expect(page.locator(`[id="${active}"]`)).toHaveText('Import clients')
  })

  test('an empty list shows its message and its action', async ({ story, page }) => {
    await story.open('primitives-select--empty-list')
    const select = page.getByRole('combobox', { name: 'Client' })
    await expect(select).toHaveText('Choose a client')
    await select.click()
    await expect(page.getByRole('listbox')).toContainText('No clients yet')
    await expect(page.getByRole('option')).toHaveText(['New client'])
  })

  test('disabled and invalid are reported', async ({ story, page }) => {
    await story.open('primitives-select--disabled')
    await expect(page.getByRole('combobox', { name: 'Region' })).toBeDisabled()
    await expect(page.getByRole('combobox', { name: 'Client' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'New client' })).toBeDisabled()
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
