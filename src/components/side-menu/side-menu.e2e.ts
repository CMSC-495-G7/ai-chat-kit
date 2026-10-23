import { expect, test } from '../../../tests/story'

test.describe('SideMenu', () => {
  test('destinations are links in the main navigation, the current one marked', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--expanded')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Page 1')
    await expect(nav.getByRole('link', { name: /^Page 2/ })).toHaveAttribute('href', '/page-2')
  })

  test('an item with sub-sections expands and collapses in place', async ({ story, page }) => {
    await story.open('components-side-menu--expanded')
    await page.getByRole('button', { name: 'Expand Page 3' }).click()
    await expect(page.getByRole('link', { name: 'Page 3b' })).toBeVisible()
    await page.getByRole('button', { name: 'Collapse Page 3' }).click()
    await expect(page.getByRole('link', { name: 'Page 3b' })).toHaveCount(0)
  })

  test('with a section open, the sub-section carries the current mark', async ({ story, page }) => {
    await story.open('components-side-menu--section-open')
    await expect(page.locator('[aria-current="page"]')).toHaveText('Page 3a')
  })

  test('in the rail each icon keeps its name, and a badge is read with it', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--rail')
    await expect(page.getByRole('link', { name: 'Page 2, 2 waiting' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Page 1' })).toBeVisible()
  })

  test('in the rail, sub-sections open in a flyout beside the icon', async ({ story, page }) => {
    await story.open('components-side-menu--rail')
    const item = page.getByRole('button', { name: 'Page 3' })
    await item.click()
    const flyout = page.getByRole('dialog', { name: 'Page 3 sections' })
    await expect(flyout.getByRole('link', { name: 'Page 3b' })).toBeVisible()
    const [icon, panel] = [(await item.boundingBox())!, (await flyout.boundingBox())!]
    expect(panel.x).toBeGreaterThan(icon.x + icon.width)
    await page.keyboard.press('Escape')
    await expect(flyout).toBeHidden()
  })

  test('only the destinations passed in are listed', async ({ story, page }) => {
    await story.open('components-side-menu--minimal')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveText(['Page 1', 'Page 2', 'Chat'])
  })
})
