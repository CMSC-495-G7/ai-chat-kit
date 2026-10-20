import { expect, test } from '../../../../tests/story'

test.describe('ToolCallChip', () => {
  test('a running call says it is running', async ({ story, page }) => {
    await story.open('chat-components-toolcallchip--running')
    await expect(page.getByRole('button', { name: 'Running ledger.balances…' })).toBeVisible()
  })

  test('a finished call opens to show what was sent and what came back', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-toolcallchip--completed')
    const chip = page.getByRole('button', { name: 'ledger.balances' })
    await expect(chip).toHaveAttribute('aria-expanded', 'false')
    await chip.click()
    await expect(chip).toHaveAttribute('aria-expanded', 'true')
  })

  test('a failed call shows its error without being opened', async ({ story, page }) => {
    await story.open('chat-components-toolcallchip--failed')
    await expect(page.getByText('Upstream timed out after 8s')).toBeVisible()
  })

  test('all three states can sit in one row', async ({ story, page }) => {
    await story.open('chat-components-toolcallchip--all-states')
    await expect(page.getByRole('button')).toHaveCount(3)
  })
})
