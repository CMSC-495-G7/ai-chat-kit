import { expect, test } from '../../../tests/story'

test.describe('DataTable', () => {
  test('it is a captioned table with a header per column', async ({ story, page }) => {
    await story.open('components-datatable--basic')
    const table = page.getByRole('table', { name: 'Tenants' })
    await expect(table.getByRole('columnheader')).toHaveCount(6)
    await expect(table.getByRole('row')).toHaveCount(7) // header and six tenants
  })

  test('a sortable header sorts, then reverses, and says which way', async ({ story, page }) => {
    await story.open('components-datatable--sorting')
    const header = page.getByRole('columnheader', { name: 'Name' })
    const firstCell = page.getByRole('row').nth(1).getByRole('cell').first()
    await header.getByRole('button').click()
    await expect(header).toHaveAttribute('aria-sort', /ascending|descending/)
    const direction = await header.getAttribute('aria-sort')
    const first = await firstCell.innerText()
    await header.getByRole('button').click()
    await expect(header).not.toHaveAttribute('aria-sort', direction!)
    await expect(firstCell).not.toHaveText(first)
  })

  test('the bulk bar counts what is selected and clears it', async ({ story, page }) => {
    const root = await story.open('components-datatable--selection')
    await expect(root.getByText('2 selected')).toBeVisible()
    await page.getByRole('checkbox', { name: 'Select tnt_8f42c19b' }).check()
    await expect(root.getByText('3 selected')).toBeVisible()
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(root.getByText(/selected/)).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Select tnt_8f42c19b' })).not.toBeChecked()
  })

  test('select all takes every row on the page, and reports a part selection as mixed', async ({
    story,
    page,
  }) => {
    const root = await story.open('components-datatable--selection')
    const all = page.getByRole('checkbox', { name: 'Select all rows on this page' })
    await expect(all).toHaveAttribute('aria-checked', 'mixed')
    await all.click()
    await expect(root.getByText('6 selected')).toBeVisible()
  })

  test('a row expands to show its detail', async ({ story, page }) => {
    await story.open('components-datatable--expandable-rows')
    const toggle = page.getByRole('button', { name: 'Prosperity Bank', exact: true })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  test('an expandable table has no caret column, and the open row carries the state', async ({
    story,
    page,
  }) => {
    await story.open('components-datatable--expandable-rows')
    // Six data columns and the actions column, and nothing for a disclosure glyph.
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(7)
    const open = page
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: 'Crestview Bank', exact: true }) })
    await expect(open).toHaveAttribute('data-open', 'true')
    const closed = page
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: 'Prosperity Bank', exact: true }) })
    await expect(closed).toHaveAttribute('data-open', 'false')
    // The avatar is filled on the open row only.
    const fill = (row: typeof open) =>
      row.locator('[data-avatar]').evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(await fill(open)).not.toBe(await fill(closed))
  })

  test('row actions stay out of the way until the row is hovered, focused or open', async ({
    story,
    page,
  }) => {
    await story.open('components-datatable--expandable-rows')
    // The fade is on the group the buttons sit in, not on each button.
    const actions = (name: string) =>
      page.getByRole('button', { name: `Edit ${name}` }).locator('xpath=..')
    await expect(actions('Crestview Bank')).toHaveCSS('opacity', '1') // open
    await expect(actions('Prosperity Bank')).toHaveCSS('opacity', '0')
    await page.getByRole('button', { name: 'Prosperity Bank', exact: true }).hover()
    await expect(actions('Prosperity Bank')).toHaveCSS('opacity', '1')
    await page.mouse.move(0, 0)
    await page.getByRole('button', { name: 'Edit Horizon National Bank' }).focus()
    await expect(actions('Horizon National Bank')).toHaveCSS('opacity', '1')
  })

  test('the sorted column marks its direction in a dark arrow, with a grey one beside it', async ({
    story,
    page,
  }) => {
    await story.open('components-datatable--sorting')
    const header = page.getByRole('columnheader', { name: 'Name' })
    await header.getByRole('button').click()
    const arrows = header.locator('svg')
    await expect(arrows).toHaveCount(2)
    const colour = (i: number) => arrows.nth(i).evaluate((el) => getComputedStyle(el).color)
    // Ascending: the up arrow is the dark one.
    expect(await colour(0)).not.toBe(await colour(1))
    const [upBefore, downBefore] = [await colour(0), await colour(1)]
    await header.getByRole('button').click()
    await expect(header).toHaveAttribute('aria-sort', 'descending')
    // Descending swaps which one is dark.
    await expect.poll(() => colour(0)).toBe(downBefore)
    await expect.poll(() => colour(1)).toBe(upBefore)
  })

  test('a status pill is outlined and small', async ({ story, page }) => {
    await story.open('components-datatable--basic')
    const pill = page.getByText('Active').first()
    await expect(pill).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    expect((await pill.boundingBox())!.height).toBeLessThanOrEqual(24)
  })

  test('loading keeps the columns and swaps only the rows for placeholders', async ({
    story,
    page,
  }) => {
    await story.open('components-datatable--loading')
    const table = page.getByRole('table')
    await expect(table.getByRole('columnheader')).toHaveCount(6)
    await expect(table.getByRole('cell').first()).toBeEmpty()
  })

  test('empty says so inside the table', async ({ story, page }) => {
    await story.open('components-datatable--empty')
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(2) // header and the message
  })

  test.describe('sorting by type', () => {
    const request = (page: import('@playwright/test').Page) =>
      page.getByRole('status', { name: 'Sort request' })
    /** The text of one column, top to bottom. */
    const column = (page: import('@playwright/test').Page, n: number) =>
      page.locator(`#storybook-root tbody tr td:nth-child(${n})`).allInnerTexts()
    const names = (page: import('@playwright/test').Page) =>
      page.locator('#storybook-root tbody tr [data-row-title]').allInnerTexts()

    test('a numeric column sorts as numbers, so 88 comes before 412', async ({ story, page }) => {
      await story.open('components-datatable--sorting')
      const header = page.getByRole('columnheader', { name: 'Seats in use' })
      await header.getByRole('button').click()
      const used = async () => (await column(page, 4)).map((cell) => Number(cell.split('/')[0]))
      // As text this would read 0, 12, 19, 287, 412, 412, 88, 903.
      expect(await used()).toEqual([0, 12, 19, 88, 287, 412, 412, 903])
      await expect(header).toHaveAttribute('aria-sort', 'ascending')
      await expect(request(page)).toHaveText('?sort=seats,asc')
      await header.getByRole('button').click()
      expect(await used()).toEqual([903, 412, 412, 287, 88, 19, 12, 0])
      await expect(request(page)).toHaveText('?sort=seats,desc')
    })

    test('a text column sorts without regard to case', async ({ story, page }) => {
      await story.open('components-datatable--sorting')
      await page.getByRole('columnheader', { name: 'Name' }).getByRole('button').click()
      const sorted = await names(page)
      // "apex Credit Union" starts with a lowercase letter and still comes first.
      expect(sorted[0]).toBe('apex Credit Union')
      expect(sorted).toEqual(
        [...sorted].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }),
        ),
      )
      await expect(request(page)).toHaveText('?sort=name,asc')
    })

    test('a date column sorts by date, and a row with no date goes last either way', async ({
      story,
      page,
    }) => {
      await story.open('components-datatable--sorting')
      const header = page.getByRole('columnheader', { name: 'Created' })
      await header.getByRole('button').click()
      const dates = async () => column(page, 5)
      let shown = await dates()
      expect(shown.at(-1)).toBe('–')
      const time = (cell: string) => new Date(cell).getTime()
      expect(shown.slice(0, -1).map(time)).toEqual(
        [...shown.slice(0, -1).map(time)].sort((a, b) => a - b),
      )
      await header.getByRole('button').click()
      shown = await dates()
      expect(shown.at(-1), 'still last when descending').toBe('–')
      expect(shown.slice(0, -1).map(time)).toEqual(
        [...shown.slice(0, -1).map(time)].sort((a, b) => b - a),
      )
    })

    test('a column with sortable: false, or with no key, is not a button and never reaches the request', async ({
      story,
      page,
    }) => {
      await story.open('components-datatable--sorting')
      for (const name of ['Email', 'Status']) {
        const header = page.getByRole('columnheader', { name })
        await expect(header.getByRole('button')).toHaveCount(0)
        await expect(header).not.toHaveAttribute('aria-sort', /.+/)
      }
      await expect(request(page)).toHaveText('(no sort parameter)')
      await page.getByRole('columnheader', { name: 'Name' }).getByRole('button').click()
      await expect(request(page)).toHaveText('?sort=name,asc')
      await expect(request(page)).not.toContainText('email')
    })
  })
})
