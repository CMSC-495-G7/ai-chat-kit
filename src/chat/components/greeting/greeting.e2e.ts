import { expect, test } from '../../../../tests/story'

test.describe('Greeting', () => {
  test('it greets the person by name in a two-line page heading', async ({ story, page }) => {
    await story.open('chat-components-greeting--morning')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Good morning, Joe. What are we working on?',
    )
  })

  test('above the heading, it says who is speaking and on what day', async ({ story, page }) => {
    await page.clock.setFixedTime(new Date('2026-10-05T08:00:00'))
    const root = await story.open('chat-components-greeting--morning')
    await expect(root).toContainText('Assistant')
    const day = root.locator('time')
    await expect(day).toHaveAttribute('datetime', '2026-10-05')
    await expect(day).toHaveText('Monday, October 5')
  })

  test("the salutation is the host's to set", async ({ story, page }) => {
    await story.open('chat-components-greeting--evening')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Good evening, Joe.')
  })

  test('left unset, it follows the clock', async ({ story, page }) => {
    for (const [time, words] of [
      ['2026-10-05T08:00:00', 'Good morning, Joe.'],
      ['2026-10-05T14:00:00', 'Good afternoon, Joe.'],
      ['2026-10-05T20:00:00', 'Good evening, Joe.'],
    ]) {
      await page.clock.setFixedTime(new Date(time))
      await story.open('chat-components-greeting--from-the-clock')
      await expect(page.getByRole('heading', { level: 1 })).toContainText(words)
    }
  })

  test('without a name, the salutation stands alone', async ({ story, page }) => {
    await story.open('chat-components-greeting--without-a-name')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Good morning. What are we working on?',
    )
  })

  test('a long name wraps inside its column', async ({ story, page }) => {
    await story.open('chat-components-greeting--long-name')
    const heading = page.getByRole('heading', { level: 1 })
    const overflow = await heading.evaluate((node) => node.scrollWidth - node.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    expect((await heading.boundingBox())!.height).toBeGreaterThan(60)
  })

  test('compact, it is a second-level heading with the date alone above it', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-components-greeting--compact')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Good morning, Joe.')
    await expect(root.locator('time')).toBeVisible()
    await expect(root).not.toContainText('Assistant')
  })
})
