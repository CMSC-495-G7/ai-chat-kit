import { expect, test } from '../../../tests/story'

test.describe('Breadcrumbs', () => {
  test('it is a named navigation landmark holding an ordered list', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--trail')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav.locator('ol')).toHaveCount(1)
    await expect(nav.getByRole('link')).toHaveCount(3)
  })

  test('the current page is marked, and is not a link', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--trail')
    const current = page.locator('[aria-current="page"]')
    await expect(current).toHaveText('Crestview Health')
    await expect(page.getByRole('link', { name: 'Crestview Health' })).toHaveCount(0)
  })

  test('separators are hidden from assistive technology', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--two-levels')
    // Two crumbs and one separator: only the crumbs are exposed as list items.
    await expect(page.getByRole('navigation').getByRole('listitem')).toHaveCount(2)
  })

  test('a long trail wraps inside a narrow column', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--wrapping-in-a-narrow-column')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    const overflow = await nav.evaluate((element) => element.scrollWidth - element.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
