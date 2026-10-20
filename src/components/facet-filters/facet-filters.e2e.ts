import { expect, test } from '../../../tests/story'

test.describe('FacetFilters', () => {
  test('it says how many items are in scope', async ({ story }) => {
    const root = await story.open('components-facetfilters--comfortable')
    await expect(root.getByText(/[\d,]+ items in scope/)).toBeVisible()
  })

  test('ticking a value selects it and counts it in its group', async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    const group = page.getByRole('button', { name: /^Accounts \d of 7/ })
    await expect(group).toHaveText(/2 of 7/)
    await page.getByRole('checkbox', { name: /^Money Market/ }).check()
    await expect(group).toHaveText(/3 of 7/)
  })

  test("an active filter's chip removes it", async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    const payroll = page.getByRole('checkbox', { name: 'Payroll , 2,489 results' })
    await expect(payroll).toBeChecked()
    await page.getByRole('button', { name: 'Remove the Accounts Payroll filter' }).click()
    await expect(payroll).not.toBeChecked()
  })

  test("a group's select-all is mixed when some of it is chosen", async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    const all = page.getByRole('checkbox', { name: 'Select all 6 available in Accounts' })
    expect(await all.evaluate((box: HTMLInputElement) => box.indeterminate)).toBe(true)
  })

  test('ticking every value says what is still left out, in plain words', async ({
    story,
    page,
  }) => {
    const root = await story.open('components-facetfilters--comfortable')
    await page.getByRole('checkbox', { name: /Select all \d+ available in Categories/ }).check()
    await expect(root).toContainText('Items with no category stay excluded')
  })

  test('a group folds away and comes back', async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    const group = page.getByRole('button', { name: /^Categories/ })
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await group.click()
    await expect(group).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('checkbox', { name: /^Groceries/ })).toHaveCount(0)
  })

  test("a group's own search narrows its options", async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    await page.getByRole('textbox', { name: 'Filter Categories options' }).fill('wire')
    await expect(page.getByRole('checkbox', { name: /^Wire fees/ })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /^Groceries/ })).toHaveCount(0)
  })

  test('Clear all removes every active filter', async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    await page.getByRole('button', { name: 'Clear all' }).click()
    await expect(page.getByRole('button', { name: /^Remove the / })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: /^Payroll/ }).first()).not.toBeChecked()
  })

  test('a custom facet can only be added once it has a value', async ({ story, page }) => {
    await story.open('components-facetfilters--comfortable')
    const add = page.getByRole('button', { name: 'Add facet' })
    await expect(add).toBeDisabled()
    await page.getByRole('textbox', { name: 'Facet value' }).fill('Delta Air Lines')
    await expect(add).toBeEnabled()
  })

  test('collapsed to a rail it is a single control that asks to be expanded', async ({
    story,
    page,
  }) => {
    await story.open('components-facetfilters--rail-collapsed')
    await expect(page.getByRole('checkbox')).toHaveCount(0)
    await expect(page.getByRole('button').first()).toBeVisible()
  })
})
