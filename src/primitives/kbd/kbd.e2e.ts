import { expect, test } from '../../../tests/story'

test.describe('Kbd', () => {
  test('it is a kbd element, so a screen reader can announce it as a key', async ({ story }) => {
    const root = await story.open('primitives-kbd--named-key')
    await expect(root.locator('kbd')).toHaveText('Esc')
  })

  test('a combination is one cap per key', async ({ story }) => {
    const root = await story.open('primitives-kbd--combination')
    await expect(root.locator('kbd')).toHaveText(['Ctrl', 'Enter'])
  })

  test('a hint row pairs each key with what it does', async ({ story }) => {
    const root = await story.open('primitives-kbd--hint-row')
    await expect(root.locator('kbd')).toHaveCount(4)
    await expect(root).toContainText('move')
    await expect(root).toContainText('accept')
    await expect(root).toContainText('hide')
  })
})
