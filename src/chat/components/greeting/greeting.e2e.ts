import { expect, test } from '../../../../tests/story'

test.describe('Greeting', () => {
  test('it greets the person by name in the page heading', async ({ story, page }) => {
    await story.open('chat-components-greeting--morning')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Good morning, Joe')
    await expect(page.getByText('How can I help you today?')).toBeVisible()
  })

  test("the salutation is the host's to set", async ({ story, page }) => {
    await story.open('chat-components-greeting--evening')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Good evening, Joe')
  })

  test('left unset, it follows the clock', async ({ story, page }) => {
    for (const [time, words] of [
      ['2026-10-05T08:00:00', 'Good morning, Joe'],
      ['2026-10-05T14:00:00', 'Good afternoon, Joe'],
      ['2026-10-05T20:00:00', 'Good evening, Joe'],
    ]) {
      await page.clock.setFixedTime(new Date(time))
      await story.open('chat-components-greeting--from-the-clock')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(words)
    }
  })

  test('a long name wraps inside its column', async ({ story, page }) => {
    await story.open('chat-components-greeting--long-name')
    const heading = page.getByRole('heading', { level: 1 })
    const overflow = await heading.evaluate((node) => node.scrollWidth - node.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    expect((await heading.boundingBox())!.height).toBeGreaterThan(60)
  })
})
