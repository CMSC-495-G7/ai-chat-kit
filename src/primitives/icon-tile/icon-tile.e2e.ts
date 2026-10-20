import { expect, test } from '../../../tests/story'

test.describe('IconTile', () => {
  for (const id of ['default', 'muted', 'warning']) {
    test(`${id}: draws its tile and stays out of the accessibility tree`, async ({ story }) => {
      const root = await story.open(`primitives-icon-tile--${id}`)
      const tile = root.locator('[aria-hidden]').first()
      await expect(tile).toBeVisible()
      // Decoration: the text beside a tile names the thing, the tile adds nothing to read.
      expect(await root.ariaSnapshot()).toBe('')
    })
  }

  test('the size prop sets a square box', async ({ story }) => {
    const root = await story.open('primitives-icon-tile--muted')
    const box = await root.locator('[aria-hidden]').first().boundingBox()
    expect([box?.width, box?.height]).toEqual([34, 34])
  })

  test('each tone has its own fill', async ({ story }) => {
    const fill = async (id: string) => {
      const root = await story.open(`primitives-icon-tile--${id}`)
      return root
        .locator('[aria-hidden]')
        .first()
        .evaluate((element) => getComputedStyle(element).backgroundColor)
    }
    const fills = [await fill('default'), await fill('muted'), await fill('warning')]
    expect(new Set(fills).size).toBe(3)
  })
})
