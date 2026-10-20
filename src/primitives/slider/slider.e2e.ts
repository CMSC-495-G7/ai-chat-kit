import { expect, test } from '../../../tests/story'

test.describe('Slider', () => {
  test('the arrow keys change the value', async ({ story, page }) => {
    await story.open('primitives-slider--playground')
    const slider = page.getByRole('slider', { name: 'Threshold' })
    const before = Number(await slider.inputValue())
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(before)
    await page.keyboard.press('Home')
    await expect.poll(async () => Number(await slider.inputValue())).toBeLessThan(before)
  })

  test('it moves by its step', async ({ story, page }) => {
    await story.open('primitives-slider--formatted-value')
    const slider = page.getByRole('slider', { name: 'Monthly budget' })
    await expect(slider).toHaveValue('45')
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveValue('50')
  })

  test('disabled and invalid are reported', async ({ story, page }) => {
    await story.open('primitives-slider--disabled')
    await expect(page.getByRole('slider', { name: 'Threshold' })).toBeDisabled()
    await story.open('primitives-slider--invalid')
    await expect(page.getByRole('slider', { name: 'Threshold' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
