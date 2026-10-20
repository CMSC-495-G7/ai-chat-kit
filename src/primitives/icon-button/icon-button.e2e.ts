import { expect, test } from '../../../tests/story'

test.describe('IconButton', () => {
  test('its label is its accessible name', async ({ story, page }) => {
    await story.open('primitives-iconbutton--playground')
    await expect(page.getByRole('button', { name: 'More actions' })).toBeVisible()
  })

  test('the three sizes are 32, 36 and 44 pixel squares', async ({ story, page }) => {
    await story.open('primitives-iconbutton--sizes')
    for (const [name, size] of [
      ['Small', 32],
      ['Medium', 36],
      ['Large', 44],
    ] as const) {
      const box = await page.getByRole('button', { name }).boundingBox()
      expect([box?.width, box?.height]).toEqual([size, size])
    }
  })

  test('disabled is disabled', async ({ story, page }) => {
    await story.open('primitives-iconbutton--disabled')
    await expect(page.getByRole('button', { name: 'More actions' })).toBeDisabled()
  })

  test('row actions each name the row they act on', async ({ story, page }) => {
    await story.open('primitives-iconbutton--row-actions')
    for (const name of [
      'Edit Crestview Bank',
      'Delete Crestview Bank',
      'More actions for Crestview Bank',
    ]) {
      await expect(page.getByRole('button', { name })).toBeVisible()
    }
  })
})
