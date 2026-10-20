import { expect, test } from '../../../../tests/story'

test.describe('Conversation', () => {
  test('empty, it greets and offers suggestions above a centred composer', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-conversation--empty')
    await expect(page.getByRole('heading', { name: 'Good morning, Joe' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Suggested for today' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Message Assistant' })).toBeVisible()
  })

  test('asking a question starts the transcript and docks the composer', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-conversation--empty')
    const box = page.getByRole('textbox', { name: 'Message Assistant' })
    const before = (await box.boundingBox())!.y
    await box.fill('Are our operating accounts within the liquidity policy right now?')
    await box.press('Enter')
    await expect(page.getByRole('heading', { name: 'Good morning, Joe' })).toHaveCount(0)
    await expect(
      page.getByText('Are our operating accounts within the liquidity policy right now?'),
    ).toBeVisible()
    const docked = page.getByRole('textbox', { name: 'Message Assistant' })
    await expect.poll(async () => (await docked.boundingBox())!.y).toBeGreaterThan(before)
  })

  test('picking a suggestion asks it', async ({ story, page }) => {
    await story.open('chat-components-conversation--empty')
    await page.getByRole('button', { name: /^Which invoices are due this week\?/ }).click()
    await expect(page.getByText('Which invoices are due this week?').first()).toBeVisible()
    await expect(page.getByRole('region', { name: 'Suggested for today' })).toHaveCount(0)
  })

  test('an answered exchange shows the disclaimer under the composer', async ({ story, page }) => {
    await story.open('chat-components-conversation--answered')
    await expect(page.getByText('AI can make mistakes. Verify important details.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible()
  })

  test('while streaming, queued questions wait in a dock above the composer', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-conversation--with-queued-questions')
    const dock = page.getByRole('list', { name: 'Queued messages' })
    await expect(dock.getByRole('listitem')).toHaveCount(3)
    const composer = (await page.getByRole('textbox', { name: 'Message Assistant' }).boundingBox())!
    expect((await dock.boundingBox())!.y).toBeLessThan(composer.y)
    await expect(page.getByRole('button', { name: 'Stop response' })).toBeVisible()
  })

  test('a failed turn offers a retry in the transcript', async ({ story, page }) => {
    await story.open('chat-components-conversation--failed-turn')
    await expect(page.getByRole('alert')).toContainText('The connection to the model was lost.')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })
})
