import { expect, test } from '../../../tests/story'

test.describe('ThemeToggle', () => {
  test('it switches the page to dark and back, and its label says what pressing does', async ({
    story,
    page,
  }) => {
    await story.open('primitives-themetoggle--default')
    const html = page.locator('html')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(html).toHaveClass(/\bdark\b/)
    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await expect(html).not.toHaveClass(/\bdark\b/)
    await expect(html).toHaveClass(/\blight\b/)
  })

  test('it remembers the choice under the key the page reads before first paint', async ({
    story,
    page,
  }) => {
    await story.open('primitives-themetoggle--in-a-bar')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    expect(await page.evaluate(() => localStorage.getItem('chat-theme-mode'))).toBe('dark')
  })

  test('it works from the keyboard', async ({ story, page }) => {
    await story.open('primitives-themetoggle--in-a-menu-row')
    await page.getByRole('button', { name: 'Switch to dark mode' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
  })
})
