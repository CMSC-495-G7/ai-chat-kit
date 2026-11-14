import { expect, test } from '../../../tests/story'

test.describe('FilterPanel', () => {
  test('each kind of field draws its own control', async ({ story, page }) => {
    await story.open('components-filterpanel--pinned')
    await expect(page.getByRole('checkbox', { name: /^Active/ })).toBeChecked()
    await expect(page.getByRole('combobox', { name: 'Plan tier' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Region' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Has active seats' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Renews before' })).toBeVisible()
  })

  test('changing a filter updates the count of filters set', async ({ story, page }) => {
    const root = await story.open('components-filterpanel--pinned')
    await expect(root).toContainText(/Refine\s*1/)
    await page.getByRole('checkbox', { name: /^Pending/ }).check()
    await page.getByRole('switch', { name: 'Has active seats' }).click()
    await expect(root).toContainText(/Refine\s*[23]/)
  })

  test('Reset clears what was set', async ({ story, page }) => {
    await story.open('components-filterpanel--pinned')
    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(page.getByRole('checkbox', { name: /^Active/ })).not.toBeChecked()
  })

  test('floating, it can be closed or pinned beside the table', async ({ story, page }) => {
    await story.open('components-filterpanel--floating')
    await expect(page.getByRole('button', { name: 'Close filters' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pin filters beside the table' })).toBeVisible()
  })

  test('several dates share one Dates section, with one row open at a time', async ({
    story,
    page,
  }) => {
    await story.open('components-filterpanel--several-dates')
    const dates = page.getByRole('group', { name: 'Dates' })
    const rows = dates.locator(':scope > div > button')
    await expect(rows).toHaveCount(3)
    await expect(dates.locator(':scope > div > button[aria-expanded="true"]')).toHaveCount(1)
    await rows.nth(2).click()
    await expect(rows.nth(2)).toHaveAttribute('aria-expanded', 'true')
    await expect(rows.nth(0)).toHaveAttribute('aria-expanded', 'false')
  })

  test('a row says what its date is set to, and a preset sets it', async ({ story, page }) => {
    await story.open('components-filterpanel--several-dates')
    const row = page.getByRole('group', { name: 'Dates' }).locator(':scope > div > button').first()
    await expect(row).toContainText('Any time')
    const preset = page
      .getByRole('group', { name: 'Created presets' })
      .getByRole('button', { name: 'Last 30 days' })
    await preset.click()
    await expect(preset).toHaveAttribute('aria-pressed', 'true')
    await expect(row).toContainText('Last 30 days')
    await preset.click()
    await expect(row).toContainText('Any time')
  })

  test('a date that looks ahead offers picks that look ahead', async ({ story, page }) => {
    await story.open('components-filterpanel--several-dates')
    await page.getByRole('group', { name: 'Dates' }).locator(':scope > div > button').nth(2).click()
    const presets = page.getByRole('group', { name: 'Renewal presets' })
    await expect(presets.getByRole('button', { name: 'Overdue' })).toBeVisible()
    await expect(presets.getByRole('button', { name: 'Next 30 days' })).toBeVisible()
    await presets.getByRole('button', { name: 'Overdue' }).click()
    await expect(
      page.getByRole('group', { name: 'Dates' }).locator(':scope > div > button').nth(2),
    ).toContainText('Overdue')
  })
})
