import { expect, test } from '../../../tests/story'

test.describe('Orb', () => {
  test('it is decoration: hidden from assistive technology', async ({ story }) => {
    const root = await story.open('primitives-orb--default')
    await expect(root.locator('.orb')).toHaveAttribute('aria-hidden', 'true')
    expect(await root.ariaSnapshot()).toBe('')
  })

  test('it is a square tile, rounded by a third, at whatever size the caller gives it', async ({
    story,
  }) => {
    const root = await story.open('primitives-orb--sizes')
    const tiles = await root.locator('.orb').evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect()
        return [box.width, box.height, getComputedStyle(node).borderTopLeftRadius]
      }),
    )
    expect(tiles).toEqual([
      [20, 20, '33.333%'],
      [24, 24, '33.333%'],
      [28, 28, '33.333%'],
      [30, 30, '33.333%'],
      [40, 40, '33.333%'],
      [64, 64, '33.333%'],
    ])
  })

  test('beside a name, the name is all that is read', async ({ story }) => {
    const root = await story.open('primitives-orb--beside-a-name')
    await expect(root).toHaveText('Assistant')
  })
})
