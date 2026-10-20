import { expect, test } from '../../../tests/story'

test.describe('FilterChip', () => {
  test('a plain chip is text with no control in it', async ({ story }) => {
    const root = await story.open('primitives-filterchip--playground')
    await expect(root).toHaveText(/Merchant:\s*Delta Air Lines/)
    await expect(root.getByRole('button')).toHaveCount(0)
  })

  test('a removable chip has a button that says what it removes', async ({ story, page }) => {
    await story.open('primitives-filterchip--removable')
    await expect(
      page.getByRole('button', { name: 'Remove Merchant: Delta Air Lines' }),
    ).toBeVisible()
  })

  test('the remove button is reachable from the keyboard', async ({ story, page }) => {
    await story.open('primitives-filterchip--removable')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /^Remove/ })).toBeFocused()
  })

  test('each tone is drawn', async ({ story }) => {
    const root = await story.open('primitives-filterchip--tones')
    await expect(root).toContainText(/Account:\s*Payroll/)
    await expect(root).toContainText(/Tag:\s*q3-offsite/)
  })
})
