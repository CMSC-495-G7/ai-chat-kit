import { expect, test } from '../../../tests/story'

test.describe('StatTile', () => {
  test('it shows a figure and what the figure counts', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--default')
    await expect(root).toContainText('3')
    await expect(root).toContainText('Runs in progress')
  })

  test('the figure is set larger than its label', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--default')
    const size = (text: string) =>
      root
        .getByText(text, { exact: true })
        .evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    expect(await size('3')).toBeGreaterThan(await size('Runs in progress'))
  })

  test('figures use tabular numerals so a row of tiles lines up', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--row')
    for (const value of ['3', '2', '1']) {
      await expect(root.getByText(value, { exact: true })).toHaveCSS(
        'font-variant-numeric',
        'tabular-nums',
      )
    }
  })

  test('zero is shown, not hidden', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--zero')
    await expect(root.getByText('0', { exact: true })).toBeVisible()
  })
})
