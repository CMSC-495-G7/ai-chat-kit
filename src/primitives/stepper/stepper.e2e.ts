import { expect, test } from '../../../tests/story'

test.describe('Stepper', () => {
  test('it is an ordered list with the current step marked', async ({ story, page }) => {
    await story.open('primitives-stepper--default')
    const list = page.getByRole('list', { name: 'Steps' })
    await expect(list.getByRole('listitem')).toHaveText(['Source', 'Connect', 'Schedule', 'Review'])
    await expect(list.locator('[aria-current="step"]')).toHaveText('Connect')
  })

  test('exactly one step is current, first and last included', async ({ story, page }) => {
    await story.open('primitives-stepper--first-step')
    await expect(page.locator('[aria-current="step"]')).toHaveText('Source')
    await story.open('primitives-stepper--last-step')
    await expect(page.locator('[aria-current="step"]')).toHaveText('Review')
    await expect(page.locator('[aria-current="step"]')).toHaveCount(1)
  })

  test('it follows the flow that drives it', async ({ story, page }) => {
    await story.open('primitives-stepper--driven-by-a-flow')
    const current = page.locator('[aria-current="step"]')
    await expect(current).toHaveText('Source')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(current).toHaveText('Connect')
    await page.getByRole('button', { name: 'Go back' }).click()
    await expect(current).toHaveText('Source')
  })

  test('on a narrow screen the steps run across instead of down', async ({ story, page }) => {
    await page.setViewportSize({ width: 700, height: 800 })
    await story.open('primitives-stepper--default')
    const items = page.getByRole('list', { name: 'Steps' }).getByRole('listitem')
    const [first, second] = [
      (await items.nth(0).boundingBox())!,
      (await items.nth(1).boundingBox())!,
    ]
    expect(second.x).toBeGreaterThan(first.x)
    expect(second.y).toBe(first.y)
  })
})
