import { expect, test } from '../../../../tests/story'

test.describe('Suggestions', () => {
  test("today's questions are a named region with a heading and a list", async ({
    story,
    page,
  }) => {
    await story.open('chat-components-suggestions--empty-state-grid')
    const region = page.getByRole('region', { name: 'Suggested for today' })
    await expect(region.getByRole('listitem')).toHaveCount(4)
    await expect(
      region.getByRole('button', { name: /^Which invoices are due this week\?/ }),
    ).toContainText('Popular in your org')
  })

  test('the menu opens from its button and lists the same questions', async ({ story, page }) => {
    await story.open('chat-components-suggestions--menu')
    const trigger = page.getByRole('button', { name: /^Suggested questions/ })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('What changed in our cash position since Friday?')).toBeVisible()
  })

  test('Escape closes the menu', async ({ story, page }) => {
    await story.open('chat-components-suggestions--menu')
    const trigger = page.getByRole('button', { name: /^Suggested questions/ })
    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('in one column the cards stack', async ({ story, page }) => {
    await story.open('chat-components-suggestions--empty-state-single-column')
    const items = page.getByRole('region', { name: 'Suggested for today' }).getByRole('listitem')
    const [first, second] = [
      (await items.nth(0).boundingBox())!,
      (await items.nth(1).boundingBox())!,
    ]
    expect(second.y).toBeGreaterThan(first.y)
    expect(second.x).toBe(first.x)
  })
})
