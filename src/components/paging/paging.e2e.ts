import { expect, test } from '../../../tests/story'

test.describe('Paging model', () => {
  test('a zero-based backend is normalised to a one-based page', async ({ story }) => {
    const root = await story.open('components-paging-model--zero-based-backend')
    await expect(root).toContainText('"number": 4') // what the backend sends
    await expect(root).toContainText('"page": 5') // what the UI is given
  })

  test('paging forward moves both the wire shape and the normalised page', async ({
    story,
    page,
  }) => {
    const root = await story.open('components-paging-model--adapter-explorer-story')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(root).toContainText('"page": 6')
    await expect(root).toContainText('"offset": 51')
  })

  test('switching backend keeps the normalised page the same', async ({ story, page }) => {
    const root = await story.open('components-paging-model--adapter-explorer-story')
    await page.getByRole('tab', { name: 'Plain / Node' }).click()
    await expect(root).toContainText('"limit": 10')
    await expect(root).toContainText('"page": 5')
    await expect(root).toContainText('"totalPages": 129')
  })

  test('on the last page, last is true and Next is disabled', async ({ story, page }) => {
    const root = await story.open('components-paging-model--last-page')
    await expect(root).toContainText('"last": true')
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})
