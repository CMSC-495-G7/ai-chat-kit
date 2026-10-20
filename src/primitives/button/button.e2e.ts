import { expect, test } from '../../../tests/story'

test.describe('Button', () => {
  test('it is a button that does not submit a form by default', async ({ story, page }) => {
    await story.open('primitives-button--playground')
    await expect(page.getByRole('button', { name: 'Save changes' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  test('the three sizes are 32, 36 and 44 pixels tall', async ({ story, page }) => {
    await story.open('primitives-button--sizes')
    for (const [name, height] of [
      ['Small 32', 32],
      ['Medium 36', 36],
      ['Large 44', 44],
    ] as const) {
      const box = await page.getByRole('button', { name }).boundingBox()
      expect(box?.height).toBe(height)
    }
  })

  test('disabled buttons cannot be focused or pressed', async ({ story, page }) => {
    await story.open('primitives-button--disabled')
    for (const button of await page.getByRole('button').all()) {
      await expect(button).toBeDisabled()
    }
  })

  test('block fills its container', async ({ story, page }) => {
    const root = await story.open('primitives-button--block')
    const button = page.getByRole('button', { name: 'Continue' })
    const [outer, inner] = await Promise.all([
      button.locator('xpath=..').boundingBox(),
      button.boundingBox(),
    ])
    await expect(root).toBeVisible()
    expect(inner?.width).toBe(outer?.width)
  })

  test('a button that navigates is a link drawn the same way', async ({ story, page }) => {
    await story.open('primitives-button--link')
    const link = page.getByRole('link', { name: 'Open destination' })
    await expect(link).toHaveAttribute('href', '#destination')
    expect((await link.boundingBox())?.height).toBe(36)
  })

  test('an adaptive button keeps its name when it collapses to an icon', async ({
    story,
    page,
  }) => {
    await story.open('primitives-button--adaptive')
    const button = page.getByRole('button', { name: 'Format view' })
    const wide = (await button.boundingBox())!.width
    await page.getByRole('slider').fill('200')
    await expect.poll(async () => (await button.boundingBox())!.width).toBeLessThan(wide)
    await expect(button).toHaveAccessibleName('Format view')
  })
})
