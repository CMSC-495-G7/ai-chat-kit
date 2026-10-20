import { expect, test } from '../../../tests/story'

test.describe('CountBadge', () => {
  test('it shows the count', async ({ story }) => {
    const root = await story.open('primitives-countbadge--playground')
    await expect(root).toHaveText('3')
  })

  test('above the maximum it reads 99+', async ({ story }) => {
    const root = await story.open('primitives-countbadge--widths')
    await expect(root.getByText('99+', { exact: true })).toHaveCount(2)
  })

  test('zero draws no badge at all', async ({ story }) => {
    const root = await story.open('primitives-countbadge--widths')
    // Seven counts are shown, the first of them zero: six badges.
    await expect(root.locator('.rounded-full')).toHaveCount(6)
  })

  test('inline it sits in the row beside its label', async ({ story }) => {
    const root = await story.open('primitives-countbadge--inline')
    const [label, badge] = await Promise.all([
      root.getByText('Filters').boundingBox(),
      root.getByText('4', { exact: true }).boundingBox(),
    ])
    expect(badge!.x).toBeGreaterThan(label!.x)
    expect(Math.abs(badge!.y + badge!.height / 2 - (label!.y + label!.height / 2))).toBeLessThan(4)
  })
})
