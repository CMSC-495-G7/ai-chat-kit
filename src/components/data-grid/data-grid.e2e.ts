import type { Locator, Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'
import { findCutOff } from '../../../tests/layout'

const id = (name: string) => `components-datagrid--${name}`
const search = (page: Page) => page.getByRole('combobox', { name: 'Search and filter tenants' })
/** The quick picks, as opposed to the panel's own groups. */
const quick = (page: Page) => page.getByRole('group', { name: 'Search and filter tenants' })
const suggestions = (page: Page) => page.getByRole('listbox', { name: 'Search and filter tenants' })
const table = (page: Page) => page.getByRole('table', { name: 'Tenants' })
const bodyRows = (page: Page) => table(page).locator('tbody tr')

const box = async (locator: Locator) => {
  const b = await locator.boundingBox()
  if (!b) throw new Error('not drawn')
  return b
}

test.describe('DataGrid, the search box', () => {
  test('clicking it while empty offers the quick picks, and a pick becomes a chip', async ({
    story,
    page,
  }) => {
    await story.open(id('everything'))
    await search(page).click()
    const picks = quick(page)
    await expect(picks.getByRole('group', { name: 'Status' })).toBeVisible()
    await picks.getByRole('button', { name: /^Pending/ }).click()
    await expect(page.getByTitle('status: Pending', { exact: true })).toBeVisible()
    await expect(table(page).getByText('Active')).toHaveCount(0)
  })

  test('typing shows values from the data first, and Enter picks the top one', async ({
    story,
    page,
  }) => {
    await story.open(id('everything'))
    await search(page).fill('bay')
    const list = suggestions(page)
    const first = list.getByRole('option').first()
    await expect(first).toContainText('Bayshore Financial')
    await expect(first).toContainText('in Name')
    await expect(list.getByRole('option', { name: /Search for/ })).toBeVisible()
    await search(page).press('Enter')
    await expect(page.getByTitle('name is Bayshore Financial', { exact: true })).toBeVisible()
    await expect(bodyRows(page)).toHaveCount(1)
    await expect(bodyRows(page).first()).toContainText('Bayshore Financial')
  })

  test('after a pick, clicking the box again brings the quick picks back', async ({
    story,
    page,
  }) => {
    await story.open(id('everything'))
    await search(page).fill('bay')
    await search(page).press('Enter')
    await expect(quick(page)).toHaveCount(0)
    await search(page).click()
    await expect(quick(page).getByRole('group', { name: 'Status' })).toBeVisible()
  })

  test('Backspace in the empty box removes the last chip', async ({ story, page }) => {
    await story.open(id('everything'))
    await search(page).fill('bay')
    await search(page).press('Enter')
    await search(page).press('Backspace')
    await expect(page.getByTitle('name is Bayshore Financial', { exact: true })).toHaveCount(0)
  })
})

test.describe('DataGrid, a simple list', () => {
  test('has search, pagination and a CSV button, and no panel or selection', async ({
    story,
    page,
  }) => {
    await story.open(id('simple-list'))
    await expect(page.getByRole('button', { name: /^Filters/ })).toHaveCount(0)
    await expect(table(page).getByRole('checkbox')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible()
    // No dates or small filters: clicking the empty box offers nothing until you type.
    await search(page).click()
    await expect(quick(page)).toHaveCount(0)
    await search(page).fill('crest')
    await search(page).press('Enter')
    await expect(bodyRows(page)).toHaveCount(1)
  })
})

test.describe('DataGrid, the docked panel', () => {
  // A page of rows, and an empty list at its least height: either way the table decides.
  for (const name of ['everything', 'states']) {
    test(`is exactly as tall as the table beside it (${name})`, async ({ story, page }) => {
      await story.open(id(name))
      const panel = page.getByRole('region', { name: 'Filters' })
      // The panel and the table are the two columns of one frame.
      const tableColumn = panel.locator('xpath=following-sibling::div[1]')
      const [p, t] = await Promise.all([box(panel), box(tableColumn)])
      expect(Math.abs(p.height - t.height)).toBeLessThanOrEqual(1)
      expect(Math.abs(p.y - t.y)).toBeLessThanOrEqual(1)
    })
  }

  test('nothing in the grid is cut off', async ({ story, page }) => {
    await story.open(id('everything'))
    expect(await findCutOff(page)).toEqual([])
  })
})

test.describe('DataGrid, selection limits', () => {
  test('maxSelections 1 draws radios, and a new pick replaces the last', async ({
    story,
    page,
  }) => {
    await story.open(id('pick-one'))
    await expect(table(page).getByRole('checkbox')).toHaveCount(0)
    await page.getByRole('radio', { name: 'Select Crestview Bank' }).check()
    await expect(page.getByTestId('picked')).toContainText('Crestview Bank')
    // A click anywhere on the row picks it.
    await bodyRows(page)
      .filter({ hasText: 'Capital Trust Bank' })
      .getByText('Capital Trust Bank')
      .click()
    await expect(page.getByRole('radio', { name: 'Select Capital Trust Bank' })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Select Crestview Bank' })).not.toBeChecked()
    await expect(page.getByText('Capital Trust Bank selected')).toBeVisible()
  })
})

test.describe('DataGrid, pagination', () => {
  test('pages through the rows, and rows per page changes the page size', async ({
    story,
    page,
  }) => {
    await story.open(id('everything'))
    await expect(page.getByText('1–8 of 14')).toBeVisible()
    await expect(bodyRows(page)).toHaveCount(8)
    await page.getByRole('button', { name: /^Next/ }).click()
    await expect(page.getByText('9–14 of 14')).toBeVisible()
    await expect(bodyRows(page)).toHaveCount(6)
    await page.getByRole('combobox', { name: 'Rows' }).click()
    await page.getByRole('option', { name: '15', exact: true }).click()
    await expect(page.getByText('1–14 of 14')).toBeVisible()
    await expect(bodyRows(page)).toHaveCount(14)
  })

  test('a filter goes back to page 1 and the range follows it', async ({ story, page }) => {
    await story.open(id('everything'))
    await page.getByRole('button', { name: /^Next/ }).click()
    await search(page).click()
    await quick(page)
      .getByRole('button', { name: /^Pending/ })
      .click()
    await expect(page.getByText('1–3 of 3')).toBeVisible()
  })

  test('is hidden while there are no rows at all', async ({ story, page }) => {
    await story.open(id('states'))
    await expect(page.getByRole('combobox', { name: 'Rows' })).toHaveCount(0)
  })
})

test.describe('DataGrid, export', () => {
  test('two formats make a menu that downloads the chosen one', async ({ story, page }) => {
    await story.open(id('everything'))
    await page.getByRole('button', { name: 'Export' }).click()
    const download = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: /JSON/ }).click()
    expect((await download).suggestedFilename()).toBe('tenants.json')
  })

  test('with rows selected, the menu asks which rows and starts on the selection', async ({
    story,
    page,
  }) => {
    await story.open(id('everything'))
    const boxes = table(page).locator('tbody').getByRole('checkbox')
    await boxes.nth(0).check()
    await boxes.nth(1).check()
    await page.getByRole('button', { name: 'Export' }).click()
    await expect(page.getByRole('radio', { name: /Selected/ })).toBeChecked()
    await expect(page.getByRole('radio', { name: /All matching/ })).toBeVisible()
  })

  test('one format and no selection is a plain button', async ({ story, page }) => {
    await story.open(id('pick-one'))
    const button = page.getByRole('button', { name: 'Export CSV' })
    await expect(button).not.toHaveAttribute('aria-haspopup')
    const download = page.waitForEvent('download')
    await button.click()
    expect((await download).suggestedFilename()).toBe('tenants.csv')
  })
})

test.describe('DataGrid, states', () => {
  const states = ['Loading', 'Nothing yet', 'No match', 'Error'] as const

  for (const name of states) {
    test(`${name} keeps the rows area at least 22rem tall`, async ({ story, page }) => {
      await story.open(id('states'))
      await page.getByRole('button', { name, exact: true }).click()
      const body = await box(table(page).locator('xpath=..'))
      const head = await box(table(page).locator('thead'))
      expect(body.height - head.height).toBeGreaterThanOrEqual(22 * 16 - 1)
    })
  }

  test('nothing yet offers the host’s action', async ({ story, page }) => {
    await story.open(id('states'))
    await expect(page.getByText('No tenants yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add tenant' })).toBeVisible()
  })

  test('no match lists the filters, and Clear all brings the rows back', async ({
    story,
    page,
  }) => {
    await story.open(id('states'))
    await page.getByRole('button', { name: 'No match', exact: true }).click()
    await expect(page.getByText('No tenants match')).toBeVisible()
    await page.getByRole('button', { name: 'Clear all filters' }).click()
    await expect(bodyRows(page)).toHaveCount(8)
  })

  test('an error is not shown as empty, and offers Try again', async ({ story, page }) => {
    await story.open(id('states'))
    await page.getByRole('button', { name: 'Error', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Couldn’t load tenants')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByText('Try again pressed 1×')).toBeVisible()
  })
})
