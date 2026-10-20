import { expect, test } from '../../../tests/story'

test.describe('CopyButton', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  })

  test('it puts the text on the clipboard', async ({ story, page }) => {
    await story.open('primitives-copybutton--in-context')
    await page.getByRole('button', { name: 'Copy' }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('tnt_8f42c19b')
  })

  test('it says so in a live region, for people who cannot see the icon change', async ({
    story,
    page,
  }) => {
    await story.open('primitives-copybutton--playground')
    const status = page.getByRole('status')
    await expect(status).toBeEmpty()
    await page.getByRole('button', { name: 'Copy' }).click()
    await expect(status).not.toBeEmpty()
  })

  test('a custom label names what is being copied', async ({ story, page }) => {
    await story.open('primitives-copybutton--custom-labels')
    await expect(page.getByRole('button', { name: 'Copy tenant ID' })).toBeVisible()
  })
})
