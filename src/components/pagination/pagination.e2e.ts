import { expect, test } from '../../../tests/story'

test.describe('Pagination', () => {
  test('it is a navigation landmark that says which rows are showing', async ({ story, page }) => {
    await story.open('components-pagination--default')
    const nav = page.getByRole('navigation', { name: 'Pagination' })
    await expect(nav).toContainText('41–50 of 1,284')
    await expect(nav.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('Next and a page number both move the page', async ({ story, page }) => {
    await story.open('components-pagination--default')
    const nav = page.getByRole('navigation', { name: 'Pagination' })
    await nav.getByRole('button', { name: 'Next' }).click()
    await expect(nav).toContainText('51–60 of 1,284')
    await nav.getByRole('button', { name: 'Page 1', exact: true }).click()
    await expect(nav).toContainText('1–10 of 1,284')
  })

  test('Previous is disabled on the first page and Next on the last', async ({ story, page }) => {
    await story.open('components-pagination--default')
    const nav = page.getByRole('navigation', { name: 'Pagination' })
    await nav.getByRole('button', { name: 'Page 1', exact: true }).click()
    await expect(nav.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await nav.getByRole('button', { name: 'Page 129', exact: true }).click()
    await expect(nav.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  test('changing rows per page changes the range', async ({ story, page }) => {
    await story.open('components-pagination--default')
    const nav = page.getByRole('navigation', { name: 'Pagination' })
    await nav.getByRole('combobox', { name: 'Rows' }).click()
    await page.getByRole('option', { name: '25', exact: true }).click()
    await expect(nav).toContainText(/of 1,284/)
    await expect(nav).not.toContainText('41–50 of 1,284')
  })

  test('compact keeps the range and the two arrows only', async ({ story, page }) => {
    await story.open('components-pagination--compact')
    await expect(
      page.getByRole('navigation', { name: 'Pagination' }).getByRole('button'),
    ).toHaveCount(2)
  })

  test('every label can be translated', async ({ story, page }) => {
    await story.open('components-pagination--custom-labels')
    await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Página 5' })).toBeVisible()
  })
})
