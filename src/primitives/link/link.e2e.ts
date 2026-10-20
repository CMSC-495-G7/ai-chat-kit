import { expect, test } from '../../../tests/story'

test.describe('Link', () => {
  test('it is a real anchor with a real address', async ({ story, page }) => {
    await story.open('primitives-link--playground')
    await expect(page.getByRole('link', { name: 'Open Tasks' })).toHaveAttribute(
      'href',
      '/t/alderfinch-treasury/tasks',
    )
  })

  test('a plain click is handed to the provider instead of leaving the page', async ({
    story,
    page,
  }) => {
    await story.open('primitives-link--under-a-provider')
    const before = page.url()
    await page.getByRole('link', { name: 'Tasks' }).click()
    await expect(page.locator('#storybook-root code')).toHaveText('/t/alderfinch-treasury/tasks')
    expect(page.url()).toBe(before)
  })

  test('a modified click is left to the browser', async ({ story, page, context }) => {
    await story.open('primitives-link--under-a-provider')
    const opened = context.waitForEvent('page')
    await page.getByRole('link', { name: 'Runs' }).click({ modifiers: ['ControlOrMeta'] })
    await (await opened).close()
    // The provider was not asked, so the address on this page did not change.
    await expect(page.locator('#storybook-root code')).toHaveText('/t/alderfinch-treasury/home')
  })

  test('Enter follows a focused link through the same handler', async ({ story, page }) => {
    await story.open('primitives-link--under-a-provider')
    await page.getByRole('link', { name: 'Runs' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#storybook-root code')).toHaveText(
      '/t/alderfinch-treasury/workflows',
    )
  })
})
