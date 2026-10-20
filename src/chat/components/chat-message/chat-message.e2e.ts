import { expect, test } from '../../../../tests/story'

test.describe('ChatMessage', () => {
  test('an answer carries its citations as buttons that name the reference', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-chatmessage--answer')
    await expect(page.getByRole('button', { name: 'Open reference 1' }).first()).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('the reasoning folds away and comes back', async ({ story, page }) => {
    await story.open('chat-components-chatmessage--answer')
    const thought = page.getByRole('button', { name: 'Thought for 3s' })
    const text = page.getByText('The policy sets a floor in days of forecast outflows.')
    const wasOpen = (await thought.getAttribute('aria-expanded')) === 'true'
    await thought.click()
    await expect(thought).toHaveAttribute('aria-expanded', String(!wasOpen))
    await thought.click()
    await expect(thought).toHaveAttribute('aria-expanded', String(wasOpen))
    await expect(text).toBeAttached()
  })

  test('a failed turn says what went wrong and offers a retry', async ({ story, page }) => {
    await story.open('chat-components-chatmessage--failed')
    await expect(page.getByRole('alert')).toContainText('The connection to the model was lost.')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('a streaming turn has no actions yet', async ({ story, page }) => {
    await story.open('chat-components-chatmessage--streaming')
    await expect(page.getByRole('button', { name: 'Regenerate' })).toHaveCount(0)
  })

  test("the reader's own message can be copied", async ({ story, page }) => {
    await story.open('chat-components-chatmessage--question')
    await expect(page.getByRole('button', { name: 'Copy question' })).toBeAttached()
  })
})
