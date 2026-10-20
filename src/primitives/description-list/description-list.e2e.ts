import { expect, test } from '../../../tests/story'

test.describe('DescriptionList', () => {
  test('it is a description list with a term and a detail per row', async ({ story }) => {
    const root = await story.open('primitives-description-list--default')
    await expect(root.locator('dl dt')).toHaveText(['Run', 'Stage'])
    await expect(root.locator('dl dd')).toHaveText(['Commercial loan review', 'Credit approval'])
  })

  test('a detail can be any content', async ({ story }) => {
    const root = await story.open('primitives-description-list--with-rich-details')
    await expect(root.locator('dd').first()).toContainText('Needs approval')
    await expect(root.locator('dd code')).toHaveText('LN-2291')
  })

  test('split rows put the term left and the detail right', async ({ story }) => {
    const root = await story.open('primitives-description-list--split-rows')
    const term = (await root.locator('dt').first().boundingBox())!
    const detail = (await root.locator('dd').first().boundingBox())!
    expect(detail.x + detail.width).toBeGreaterThan(term.x + term.width)
    expect(Math.abs(detail.y - term.y)).toBeLessThan(4)
  })

  test('a long detail wraps inside its column', async ({ story }) => {
    const root = await story.open('primitives-description-list--long-values')
    const list = (await root.locator('dl').boundingBox())!
    const detail = (await root.locator('dd').first().boundingBox())!
    expect(detail.x + detail.width).toBeLessThanOrEqual(list.x + list.width + 1)
    expect(detail.height).toBeGreaterThan(20)
  })
})
