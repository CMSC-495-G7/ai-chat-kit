import { expect, test } from '../../../tests/story'

test.describe('ScrollToBottomButton', () => {
  test('it is a button with a default label', async ({ story, page }) => {
    await story.open('primitives-scrolltobottombutton--visible')
    await expect(page.getByRole('button', { name: 'New messages' })).toBeVisible()
  })

  test('the label can say how many', async ({ story, page }) => {
    await story.open('primitives-scrolltobottombutton--custom-label')
    await expect(page.getByRole('button', { name: '3 new messages' })).toBeVisible()
  })

  test('it appears once the reader scrolls up, and takes them back down', async ({
    story,
    page,
  }) => {
    // The story streams a line every 900ms. A controlled clock lets it grow
    // long enough to scroll without the test waiting on real time.
    await page.clock.install()
    const root = await story.open('primitives-scrolltobottombutton--with-stick-to-bottom')
    await page.clock.runFor(18_000)
    const scroller = root.locator('.overflow-y-auto').first()
    await scroller.hover()
    await page.mouse.wheel(0, -2000)
    await page.clock.runFor(500)
    const button = page.getByRole('button', { name: 'New messages' })
    await expect(button).toBeVisible()
    await button.click()
    await page.clock.runFor(1500)
    await expect
      .poll(() =>
        scroller.evaluate((node) => node.scrollHeight - node.scrollTop - node.clientHeight),
      )
      .toBeLessThan(60)
  })
})
