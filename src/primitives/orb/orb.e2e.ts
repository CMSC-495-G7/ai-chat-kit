import { expect, test } from '../../../tests/story'

test.describe('Orb', () => {
  test('it is decoration: hidden from assistive technology', async ({ story }) => {
    const root = await story.open('primitives-orb--default')
    await expect(root.locator('.orb')).toHaveAttribute('aria-hidden', 'true')
    expect(await root.ariaSnapshot()).toBe('')
  })

  test('it is a circle at whatever size the caller gives it', async ({ story }) => {
    const root = await story.open('primitives-orb--sizes')
    const sizes = await root.locator('.orb').evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect()
        return [box.width, box.height]
      }),
    )
    expect(sizes).toEqual([
      [20, 20],
      [24, 24],
      [28, 28],
      [30, 30],
      [40, 40],
      [64, 64],
    ])
  })

  test('beside a name, the name is all that is read', async ({ story }) => {
    const root = await story.open('primitives-orb--beside-a-name')
    await expect(root).toHaveText('Assistant')
  })
})
