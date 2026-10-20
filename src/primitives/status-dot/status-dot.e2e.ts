import { expect, test } from '../../../tests/story'

test.describe('StatusDot', () => {
  test('it is decoration: the word beside it carries the meaning', async ({ story }) => {
    const root = await story.open('primitives-status-dot--with-labels')
    await expect(root.locator('[aria-hidden="true"]')).toHaveCount(4)
    await expect(root.getByRole('listitem')).toHaveText([
      'Running',
      'Waiting on a person',
      'Failed',
      'Queued',
    ])
  })

  test('the size prop sets a circle of that many pixels', async ({ story }) => {
    const root = await story.open('primitives-status-dot--sizes')
    const sizes = await root
      .locator('[aria-hidden="true"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width))
    expect(sizes).toEqual([6, 7, 8, 10, 12])
  })

  test('colour comes from the caller, so each status can have its own', async ({ story }) => {
    const root = await story.open('primitives-status-dot--default')
    const colours = await root
      .locator('[aria-hidden="true"]')
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor))
    expect(new Set(colours).size).toBe(3)
  })
})
