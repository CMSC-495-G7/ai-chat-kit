import { expect, test } from '../../../tests/story'

test.describe('EmptyState', () => {
  test('it has a heading and a line that says what will appear', async ({ story, page }) => {
    await story.open('primitives-empty-state--default')
    await expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible()
    await expect(page.getByText('Items will appear here when they are available.')).toBeVisible()
  })

  test('an action offers the way forward', async ({ story, page }) => {
    await story.open('primitives-empty-state--with-action')
    await expect(page.getByRole('button', { name: 'Add a source' })).toBeVisible()
  })

  test('with only a body there is no empty heading left behind', async ({ story, page }) => {
    await story.open('primitives-empty-state--body-only')
    await expect(page.getByRole('heading')).toHaveCount(0)
    await expect(page.getByText('Nothing in Alderfinch Retail is waiting on you.')).toBeVisible()
  })

  test('in a panel the mark sits above the copy and both are centred', async ({ story }) => {
    const root = await story.open('primitives-empty-state--centred-in-a-panel')
    const orb = (await root.locator('.orb').boundingBox())!
    const copy = (await root.getByText('Select a step on the canvas').boundingBox())!
    expect(orb.y).toBeLessThan(copy.y)
    expect(Math.abs(orb.x + orb.width / 2 - (copy.x + copy.width / 2))).toBeLessThan(2)
  })
})
