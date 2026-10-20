import { expect, test } from '../../../tests/story'

test.describe('DatePicker', () => {
  test('it is a labelled calendar grid', async ({ story, page }) => {
    await story.open('primitives-datepicker--playground')
    await expect(page.getByRole('group', { name: 'Renewal date' }).first()).toBeVisible()
    await expect(page.getByRole('columnheader')).toHaveCount(7)
  })

  test('the month buttons move the calendar', async ({ story, page }) => {
    const root = await story.open('primitives-datepicker--playground')
    await expect(root).toContainText('September 2026')
    await page.getByRole('button', { name: 'Next month' }).click()
    await expect(root).toContainText('October 2026')
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(root).toContainText('September 2026')
  })

  test('choosing a day selects it', async ({ story, page }) => {
    await story.open('primitives-datepicker--empty')
    // The empty calendar opens on the current month, so the day is picked by position.
    const day = page.getByRole('gridcell', { name: /^Choose / }).nth(12)
    await day.click()
    await expect(day).toHaveAttribute('aria-selected', 'true')
  })

  test('days outside the bounds cannot be chosen', async ({ story, page }) => {
    await story.open('primitives-datepicker--bounded')
    await expect(page.getByRole('gridcell', { name: /September 3rd, 2026/ })).toBeDisabled()
    await expect(
      page.getByRole('gridcell', { name: /Choose Thursday, September 10th/ }),
    ).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeDisabled()
  })

  test('the arrow keys move between days', async ({ story, page }) => {
    await story.open('primitives-datepicker--playground')
    const selected = page.getByRole('gridcell', { name: /September 18th, 2026/ })
    await selected.click()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('gridcell', { name: /September 19th, 2026/ })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('gridcell', { name: /September 26th, 2026/ })).toBeFocused()
  })
})
