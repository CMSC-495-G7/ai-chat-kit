import { expect, test } from '../../../../tests/story'

test.describe('QueueDock', () => {
  test('queued messages are a named list, each item saying its place', async ({ story, page }) => {
    await story.open('chat-components-queuedock--queued')
    const list = page.getByRole('list', { name: 'Queued messages' })
    await expect(list.getByRole('listitem')).toHaveCount(3)
    await expect(
      list.getByRole('listitem', { name: /^Queued message 1 of 3: How many days of cover/ }),
    ).toBeVisible()
  })

  test('held, it says nothing will send and offers Resume', async ({ story, page }) => {
    await story.open('chat-components-queuedock--held')
    await expect(page.getByRole('status')).toContainText('Nothing sends until you resume')
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()
  })

  test('the dock folds to its header and back', async ({ story, page }) => {
    await story.open('chat-components-queuedock--queued')
    const fold = page.getByRole('button', { name: /^Minimize/ })
    await expect(fold).toHaveAttribute('aria-expanded', 'true')
    await fold.click()
    const unfold = page.getByRole('button', { name: 'Expand the queue' })
    await expect(unfold).toHaveAttribute('aria-expanded', 'false')
    await expect(
      page.getByRole('list', { name: 'Queued messages' }).getByRole('listitem'),
    ).toHaveCount(1)
    await unfold.click()
    await expect(
      page.getByRole('list', { name: 'Queued messages' }).getByRole('listitem'),
    ).toHaveCount(3)
  })

  test('every row action names the message it acts on', async ({ story, page }) => {
    await story.open('chat-components-queuedock--queued')
    await expect(page.getByRole('button', { name: 'Edit queued message 2' })).toBeAttached()
    await expect(page.getByRole('button', { name: 'Remove queued message 2' })).toBeAttached()
    await expect(
      page.getByRole('button', { name: 'More options for queued message 2' }),
    ).toBeAttached()
  })

  test('building a chain, Run is disabled until there is a first question', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-queuedock--planning-chain')
    await expect(page.getByRole('button', { name: 'Run queue' })).toBeDisabled()
    await expect(page.getByRole('status')).toContainText('Nothing runs until you start it')
  })
})
