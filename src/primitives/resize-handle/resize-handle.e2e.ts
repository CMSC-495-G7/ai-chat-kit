import { expect, test } from '../../../tests/story'

test.describe('ResizeHandle', () => {
  test('it is a named separator', async ({ story, page }) => {
    await story.open('primitives-resizehandle--idle')
    await expect(page.getByRole('separator', { name: 'Resize panel' })).toBeVisible()
  })

  test('it shows the column-resize cursor', async ({ story, page }) => {
    await story.open('primitives-resizehandle--idle')
    const cursor = await page
      .getByRole('separator')
      .evaluate((node) => getComputedStyle(node).cursor)
    expect(cursor).toBe('col-resize')
  })

  test('it sits on the left edge of the column it resizes', async ({ story, page }) => {
    await story.open('primitives-resizehandle--between-two-columns')
    const handle = (await page.getByRole('separator').boundingBox())!
    const column = (await page.getByText('The reference panel').boundingBox())!
    expect(Math.abs(handle.x + handle.width / 2 - column.x)).toBeLessThan(handle.width)
  })

  test('active keeps the grip highlighted while a drag is under way', async ({ story, page }) => {
    const grip = () =>
      page
        .getByRole('separator')
        .evaluate((node) =>
          [node, ...node.querySelectorAll('*')]
            .map((item) => getComputedStyle(item).backgroundColor)
            .join('|'),
        )
    await story.open('primitives-resizehandle--idle')
    const idle = await grip()
    await story.open('primitives-resizehandle--dragging')
    expect(await grip()).not.toBe(idle)
  })
})
