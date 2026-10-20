import { expect, test } from '../../../tests/story'

test.describe('Checkbox', () => {
  test('clicking the label toggles it', async ({ story, page }) => {
    await story.open('primitives-checkbox--playground')
    const box = page.getByRole('checkbox', { name: 'Email me a weekly digest' })
    const before = await box.isChecked()
    await page.getByText('Email me a weekly digest').last().click()
    expect(await box.isChecked()).toBe(!before)
  })

  test('space toggles it from the keyboard', async ({ story, page }) => {
    await story.open('primitives-checkbox--playground')
    const box = page.getByRole('checkbox', { name: 'Email me a weekly digest' })
    const before = await box.isChecked()
    await box.focus()
    await page.keyboard.press('Space')
    expect(await box.isChecked()).toBe(!before)
  })

  test('mixed is reported as mixed, and disabled as disabled', async ({ story, page }) => {
    await story.open('primitives-checkbox--states')
    await expect(page.getByRole('checkbox', { name: 'Mixed' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    )
    await expect(page.getByRole('checkbox', { name: 'Disabled', exact: true })).toBeDisabled()
  })

  test('select all checks every row, then clears them', async ({ story, page }) => {
    await story.open('primitives-checkbox--select-all-with-counts')
    const all = page.getByRole('checkbox', { name: 'Select all' })
    const rows = [/^Active/, /^Pending/, /^Suspended/].map((name) =>
      page.getByRole('checkbox', { name }),
    )
    await all.click()
    for (const row of rows) await expect(row).toBeChecked()
    await all.click()
    for (const row of rows) await expect(row).not.toBeChecked()
  })
})
