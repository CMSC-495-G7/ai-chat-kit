import { expect, test } from '../../../../tests/story'

test.describe('TurnTrace', () => {
  test('the handle shows how long the turn took and opens the steps', async ({ story, page }) => {
    await story.open('chat-components-turntrace--ok')
    const handle = page.getByRole('button', { name: '4.2s' })
    await expect(handle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('listitem')).toHaveCount(3)
    await handle.click()
    await expect(handle).toHaveAttribute('aria-expanded', 'false')
  })

  test('each step is read with when it started and how long it took', async ({ story, page }) => {
    await story.open('chat-components-turntrace--ok')
    await expect(page.getByRole('listitem').nth(1)).toHaveText(
      /Started at 1\.2s.*ledger\.balances.*took 0\.6s/,
    )
  })

  test('a turn that recovered from a fault says the answer is complete', async ({
    story,
    page,
  }) => {
    const root = await story.open('chat-components-turntrace--recovered')
    await expect(page.getByRole('button', { name: '6.9s · recovered' })).toBeVisible()
    await expect(root).toContainText('The answer is complete.')
  })

  test('a failed turn is an alert with the reason and a retry', async ({ story, page }) => {
    await story.open('chat-components-turntrace--failure')
    await expect(page.getByRole('alert')).toContainText('The connection to the model was lost.')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('a stopped turn says where it stopped', async ({ story }) => {
    const root = await story.open('chat-components-turntrace--stopped')
    await expect(root).toContainText('Stopped after 2.0s')
  })
})
