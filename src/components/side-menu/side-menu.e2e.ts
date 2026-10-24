import { expect, test } from '../../../tests/story'

test.describe('SideMenu', () => {
  test('the rail lists the apps by their short names, the current one marked', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    const rail = page.getByRole('navigation', { name: 'Apps' })
    await expect(rail.locator('[aria-current="page"]')).toContainText('Work')
    await expect(rail.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
    await expect(rail.getByRole('link', { name: 'Tasks, 2 waiting' })).toBeVisible()
  })

  test('pressing your own app’s icon folds its panel away, and again brings it back', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    const panel = page.getByRole('complementary', { name: 'Projects' })
    await expect(panel).toBeVisible()
    await page.getByRole('link', { name: 'Projects' }).click()
    await expect(panel).toHaveCount(0)
    await page.getByRole('link', { name: 'Projects' }).click()
    await expect(panel).toBeVisible()
  })

  test('the panel’s collapse button folds it', async ({ story, page }) => {
    await story.open('components-side-menu--default')
    await page.getByRole('button', { name: 'Collapse panel' }).click()
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })

  test('an app without a panel is the rail alone', async ({ story, page }) => {
    await story.open('components-side-menu--no-panel')
    await expect(page.getByRole('navigation', { name: 'Apps' })).toBeVisible()
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })

  test('the panel’s edge is a separator the arrow keys move, and a double-click resets', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    const panel = page.getByRole('complementary', { name: 'Projects' })
    const handle = page.getByRole('separator', { name: 'Resize the Projects panel' })
    await expect(handle).toHaveAttribute('aria-valuenow', '260')
    await handle.focus()
    await page.keyboard.press('ArrowRight')
    await expect(handle).toHaveAttribute('aria-valuenow', '276')
    await page.keyboard.press('End')
    await expect(handle).toHaveAttribute('aria-valuenow', '420')
    await expect(panel).toHaveCSS('width', '420px')
    await handle.dblclick()
    await expect(handle).toHaveAttribute('aria-valuenow', '260')
  })

  test('dragging the edge changes the width', async ({ story, page }) => {
    await story.open('components-side-menu--default')
    const handle = page.getByRole('separator', { name: 'Resize the Projects panel' })
    const box = (await handle.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + 200)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 200, { steps: 4 })
    await page.mouse.up()
    await expect
      .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
      .toBeGreaterThan(300)
  })

  test('the grid opens every app as a tile, and the search narrows them', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    await page.getByRole('button', { name: 'All apps' }).click()
    const panel = page.getByRole('complementary', { name: 'All apps' })
    await expect(panel.getByRole('link', { name: 'Insights' })).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Ingestion' })).toBeVisible()
    await panel.getByRole('searchbox').fill('inge')
    await expect(panel.getByRole('link', { name: 'Insights' })).toHaveCount(0)
    await panel.getByRole('searchbox').fill('zzz')
    await expect(panel).toContainText('Nothing called “zzz”.')
  })

  test('with the panel folded, resting on the icon shows the short version, which can pin it', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--panel-folded')
    await page.getByRole('link', { name: 'Projects' }).hover()
    const card = page.getByRole('group', { name: 'Projects' })
    await expect(card).toContainText('Recently viewed')
    await card.getByRole('button', { name: 'Pin panel' }).click()
    await expect(page.getByRole('complementary', { name: 'Projects' })).toBeVisible()
  })

  test('a page adds a section to the panel, and it stays the page’s own', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--with-page-section')
    const section = page.getByRole('region', { name: 'This page' })
    await expect(section).toContainText('Positive pay exceptions')
    await page.getByRole('button', { name: 'Collapse panel' }).click()
    await expect(section).toHaveCount(0)
  })
})
