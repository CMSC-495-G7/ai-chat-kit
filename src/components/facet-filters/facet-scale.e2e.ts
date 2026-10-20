import { expect, test } from '../../../tests/story'

for (const variant of ['local-3000', 'local-10000', 'compact-10000']) {
  test(`${variant}: local search and bounded rendering`, async ({ story, page }) => {
    const root = await story.open(`components-facetfilters--${variant}`)
    await page.getByRole('button', { name: /^Show [\d,]+ more$/ }).click()
    const list = page.getByRole('group', { name: 'Accounts options', exact: true })
    await expect(list).toBeVisible()
    expect(await list.getByRole('checkbox').count()).toBeLessThan(25)
    await page
      .getByRole('textbox', { name: 'Filter Accounts options' })
      .fill(variant === 'local-3000' ? '03000' : '10000')
    const last = page.getByRole('checkbox', {
      name: new RegExp(variant === 'local-3000' ? '^Account 03000' : '^Account 10000'),
    })
    await expect(last).toBeVisible()
    await last.check()
    await expect(last).toBeChecked()
    await expect(root.getByRole('button', { name: /^Remove the Accounts Account/ })).toHaveCount(1)
    await page.getByRole('textbox', { name: 'Filter Accounts options' }).fill('no such account')
    await expect(page.getByText('Nothing here matches that.')).toBeVisible()
    // Filtering never removes the selected value from controlled state.
    await expect(root.getByRole('button', { name: /^Remove the Accounts Account/ })).toHaveCount(1)
  })
}

test('keyboard crosses virtual boundaries, selects, and exits with Tab', async ({
  story,
  page,
}) => {
  await story.open('components-facetfilters--local-10000')
  await page.getByRole('button', { name: /^Show [\d,]+ more$/ }).click()
  const search = page.getByRole('textbox', { name: 'Filter Accounts options' })
  await search.focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('checkbox', { name: /^Account 00001/ })).toBeFocused()
  for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowDown')
  const row31 = page.getByRole('checkbox', { name: /^Account 00031/ })
  await expect(row31).toBeFocused()
  await page.keyboard.press('Space')
  await expect(row31).toBeChecked()
  await expect(row31).toBeFocused()
  await page.keyboard.press('End')
  const last = page.getByRole('checkbox', { name: /^Account 10000/ })
  await expect(last).toBeFocused()
  await page.keyboard.press('Space')
  await expect(last).toBeChecked()
  await expect(last.locator('xpath=ancestor::li')).toHaveAttribute('aria-posinset', '10000')
  await expect(last.locator('xpath=ancestor::li')).toHaveAttribute('aria-setsize', '10000')
  await page.keyboard.press('Home')
  await expect(page.getByRole('checkbox', { name: /^Account 00001/ })).toBeFocused()
  await page.keyboard.press('PageDown')
  await expect(page.getByRole('checkbox', { name: /^Account 00010/ })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(search).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('checkbox', { name: /^Account 00010/ })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect
    .poll(() =>
      page
        .getByRole('group', { name: 'Accounts options', exact: true })
        .evaluate((node) => node.contains(document.activeElement)),
    )
    .toBe(false)
})

test('selection and count refresh preserve row positions and scroll offset', async ({
  story,
  page,
}, testInfo) => {
  await story.open('components-facetfilters--local-10000')
  await page.getByRole('button', { name: /^Show [\d,]+ more$/ }).click()
  const list = page.getByRole('group', { name: 'Accounts options', exact: true })
  const first = page.getByRole('checkbox', { name: /^Account 00001/ })
  await first.focus()
  for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowDown')
  const target = page.getByRole('checkbox', { name: /^Account 00026/ })
  const targetRow = target.locator('xpath=ancestor::li')
  const beforeBox = await targetRow.boundingBox()
  const beforeTop = await list.evaluate((node) => node.scrollTop)
  await expect(list).toHaveScreenshot('10k-before-selection.png')
  await testInfo.attach('before-selection', {
    body: await list.screenshot(),
    contentType: 'image/png',
  })
  await page.keyboard.press('Space')
  await expect(target).toBeFocused()
  await expect(target).toBeChecked()
  expect(await targetRow.boundingBox()).toEqual(beforeBox)
  expect(await list.evaluate((node) => node.scrollTop)).toBe(beforeTop)
  await expect(list).toHaveScreenshot('10k-after-selection.png')
  await testInfo.attach('after-selection', {
    body: await list.screenshot(),
    contentType: 'image/png',
  })
  // Refresh through the host without stealing keyboard focus from the row.
  await page
    .getByRole('button', { name: 'Refresh counts' })
    .evaluate((node: HTMLButtonElement) => node.click())
  await expect(target).toBeFocused()
  expect(await targetRow.boundingBox()).toEqual(beforeBox)
  expect(await list.evaluate((node) => node.scrollTop)).toBe(beforeTop)
  await expect(list).toHaveScreenshot('10k-after-refresh.png')
  await testInfo.attach('after-refresh', {
    body: await list.screenshot(),
    contentType: 'image/png',
  })
  // A now-unavailable row keeps its position but cannot be selected.
  await page.keyboard.press('Home')
  await expect(page.getByRole('checkbox', { name: /^Account 00002/ })).toBeFocused()
  await expect(page.getByRole('checkbox', { name: /^Account 00001/ })).toBeDisabled()
})

test('one of six accounts matching 1000 records creates one chip', async ({ story, page }) => {
  await story.open('components-facetfilters--six-accounts')
  await page.getByRole('checkbox', { name: /^Account 1 / }).check()
  await expect(page.getByText('1,000 items in scope')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Accounts 1 of 6$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Remove the Accounts/ })).toHaveCount(1)
})

test('1000 selected values expand to a bounded preview, collapse, remove, and clear', async ({
  story,
  page,
}, testInfo) => {
  await story.open('components-facetfilters--thousand-selected')
  const summary = page.getByRole('button', { name: 'Accounts · 1,000 of 6,000' })
  await expect(page.getByRole('button', { name: /^Remove the Accounts/ })).toHaveCount(0)
  await summary.click()
  await expect(summary).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: /^Remove the Accounts/ })).toHaveCount(20)
  await expect(page.locator('#storybook-root')).toHaveScreenshot('1000-selection-preview.png')
  await testInfo.attach('bounded-expanded-selection', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
  await summary.click()
  await expect(summary).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('button', { name: /^Remove the Accounts/ })).toHaveCount(0)
  await summary.click()
  await page.getByRole('button', { name: 'Remove the Accounts Account 00001 filter' }).click()
  await expect(page.getByRole('button', { name: 'Accounts · 999 of 6,000' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear Accounts filters', exact: true }).first().click()
  await expect(
    page.getByText('No filters yet. Answers draw from everything in scope.'),
  ).toBeVisible()
})

test('large searches promote a query instead of enumerating, small searches support undo', async ({
  story,
  page,
}) => {
  await story.open('components-facetfilters--local-10000')
  const search = page.getByRole('textbox', { name: 'Filter Accounts options' })
  await search.fill('Account')
  await expect(page.getByRole('checkbox', { name: /^Select all/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Filter by this search instead' }).click()
  await expect(page.getByRole('button', { name: 'Remove the Account search filter' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Remove the Accounts Account/ })).toHaveCount(0)
  await search.fill('0999')
  await page.getByRole('button', { name: 'Select all 11', exact: true }).click()
  await expect(page.getByText('11 added in one go.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByRole('button', { name: /^Accounts 11 of/ })).toHaveCount(0)
})

test('remote lookup still searches and loads additional pages', async ({ story, page }) => {
  await story.open('components-facetfilters--comfortable')
  await page.getByRole('button', { name: /^Loan Number/ }).click()
  const list = page.getByRole('group', { name: 'Loan Number options', exact: true })
  await expect(list).toBeVisible()
  expect(await list.getByRole('checkbox').count()).toBeLessThan(25)
  const before = await list.getByRole('listitem').first().getAttribute('aria-setsize')
  await page.getByRole('button', { name: 'Load 50 more' }).click()
  await expect(list.getByRole('listitem').first()).toHaveAttribute(
    'aria-setsize',
    String(Number(before) + 50),
  )
  const search = page.getByRole('textbox', { name: 'Filter Loan Number options' })
  const value = (await list
    .getByRole('listitem')
    .first()
    .locator('span.truncate')
    .textContent())!.trim()
  await search.fill(value)
  await expect(page.getByRole('checkbox', { name: new RegExp(`^${value} `) })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Load 50 more' })).toHaveCount(0)
})

test('a focused row stays mounted during wheel-style scrolling', async ({ story, page }) => {
  await story.open('components-facetfilters--local-10000')
  await page.getByRole('button', { name: /^Show [\d,]+ more$/ }).click()
  const list = page.getByRole('group', { name: 'Accounts options', exact: true })
  const first = page.getByRole('checkbox', { name: /^Account 00001/ })
  await first.focus()
  await list.evaluate((node) => {
    node.scrollTop = 200000
  })
  await expect(first).toBeFocused()
  expect(await list.getByRole('checkbox').count()).toBeLessThan(25)
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('checkbox', { name: /^Account 00002/ })).toBeFocused()
})

test('compact panel keyboard navigation reaches the last value and Done', async ({
  story,
  page,
}) => {
  await story.open('components-facetfilters--compact-10000')
  await page.getByRole('button', { name: /^Show [\d,]+ more$/ }).click()
  const search = page.getByRole('textbox', { name: 'Filter Accounts options' })
  await search.focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('checkbox', { name: /^Account 00001/ })).toBeFocused()
  await page.keyboard.press('PageDown')
  await expect(page.getByRole('checkbox', { name: /^Account 00007/ })).toBeFocused()
  await page.keyboard.press('End')
  const last = page.getByRole('checkbox', { name: /^Account 10000/ })
  await expect(last).toBeFocused()
  await page.keyboard.press('Space')
  await expect(last).toBeChecked()
  await expect(last).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Done', exact: true })).toBeFocused()
})
