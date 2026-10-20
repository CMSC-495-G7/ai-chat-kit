import { expect, test } from '../../../tests/story'

test.describe('SideTabs', () => {
  test('the rail is a tab list; a badge is read with its tab', async ({ story, page }) => {
    await story.open('components-sidetabs--rail')
    await expect(page.getByRole('tab', { name: 'Filters, 3' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tab')).toHaveCount(3)
  })

  test('choosing a tab opens its panel', async ({ story, page }) => {
    const root = await story.open('components-sidetabs--rail-and-panel')
    await page.getByRole('tab', { name: 'Persona' }).click()
    await expect(root.getByText('Persona', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close persona' })).toBeVisible()
  })

  test('choosing the open tab again closes the panel', async ({ story, page }) => {
    const root = await story.open('components-sidetabs--rail-and-panel')
    await page.getByRole('tab', { name: 'Filters, 3' }).click()
    await expect(root.getByText('Chat column')).toBeVisible()
    await expect(page.getByRole('tab', { selected: true })).toHaveCount(0)
  })

  test("the panel's close button closes it", async ({ story, page }) => {
    const root = await story.open('components-sidetabs--rail-and-panel')
    await page.getByRole('button', { name: 'Close filters' }).click()
    await expect(root.getByText('Chat column')).toBeVisible()
  })

  test('with nothing open, no tab is selected', async ({ story, page }) => {
    await story.open('components-sidetabs--nothing-open')
    await expect(page.getByRole('tab', { selected: true })).toHaveCount(0)
  })
})
