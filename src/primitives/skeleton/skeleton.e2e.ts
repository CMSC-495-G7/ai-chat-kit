import { expect, test } from '../../../tests/story'

test.describe('Skeleton', () => {
  test('a placeholder is hidden from assistive technology', async ({ story }) => {
    const root = await story.open('primitives-skeleton--paragraph')
    expect(await root.ariaSnapshot()).toBe('')
    await expect(root.locator('span.animate-pulse')).toHaveCount(4)
  })

  test('the caller sets its size and shape', async ({ story }) => {
    const root = await story.open('primitives-skeleton--shapes')
    const circle = root.locator('span.animate-pulse').first()
    const box = (await circle.boundingBox())!
    expect([box.width, box.height]).toEqual([36, 36])
    await expect(circle).toHaveCSS('border-radius', /^(9999|3\.35544e\+07)px$/)
  })

  test('a loading card says it is loading, once, rather than per bar', async ({ story, page }) => {
    await story.open('primitives-skeleton--card-placeholder')
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(1)
  })

  test('with reduced motion it does not pulse', async ({ story }) => {
    const root = await story.open('primitives-skeleton--default')
    const duration = await root
      .locator('span.animate-pulse')
      .evaluate((node) => parseFloat(getComputedStyle(node).animationDuration))
    expect(duration).toBeLessThan(0.01)
  })
})
