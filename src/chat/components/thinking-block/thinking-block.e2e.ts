import { expect, test } from '../../../../tests/story'

test.describe('ThinkingBlock', () => {
  test('while thinking, the header says so', async ({ story, page }) => {
    await story.open('chat-components-thinkingblock--active')
    await expect(page.getByRole('button', { name: 'Thinking…' })).toBeVisible()
  })

  test('once finished, it says how long it took', async ({ story, page }) => {
    await story.open('chat-components-thinkingblock--finished')
    await expect(page.getByRole('button', { name: 'Thought for 3s' })).toBeVisible()
  })

  test('the header folds the reasoning away and back', async ({ story, page }) => {
    await story.open('chat-components-thinkingblock--finished')
    const header = page.getByRole('button', { name: 'Thought for 3s' })
    const before = await header.getAttribute('aria-expanded')
    await header.click()
    await expect(header).not.toHaveAttribute('aria-expanded', before!)
    await header.click()
    await expect(header).toHaveAttribute('aria-expanded', before!)
  })

  test('a paused turn says the reasoning stopped', async ({ story, page }) => {
    await story.open('chat-components-thinkingblock--paused')
    await expect(page.getByRole('button', { name: 'Reasoning paused' })).toBeVisible()
  })
})
