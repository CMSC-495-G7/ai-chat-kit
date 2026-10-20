import { expect, test } from '../../../tests/story'

test.describe('MermaidBlock', () => {
  test('a diagram is a figure with an image named for its kind', async ({ story, page }) => {
    await story.open('components-mermaidblock--flowchart')
    await expect(page.getByRole('figure')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Flowchart' }).first()).toBeVisible()
  })

  test('the source can be shown and hidden again', async ({ story, page }) => {
    const root = await story.open('components-mermaidblock--flowchart')
    await page.getByRole('button', { name: 'Show diagram source' }).click()
    await expect(root.locator('pre, code').first()).toContainText('flowchart')
    await page
      .getByRole('button', { name: /diagram source/ })
      .first()
      .click()
  })

  test('the source can be copied', async ({ story, page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await story.open('components-mermaidblock--sequence')
    await page.getByRole('button', { name: 'Copy diagram source' }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('sequenceDiagram')
  })

  test('while the source is still streaming it shows a placeholder, not a broken diagram', async ({
    story,
    page,
  }) => {
    await story.open('components-mermaidblock--streaming')
    await expect(page.getByRole('figure')).toContainText('Drawing diagram')
  })

  test('source that cannot be drawn does not take the page down', async ({ story, page }) => {
    await story.open('components-mermaidblock--invalid')
    await expect(page.getByRole('figure')).toBeVisible()
  })
})
