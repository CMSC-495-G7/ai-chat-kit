import { expect, test } from '../../../../tests/story'

test.describe('FollowupChips', () => {
  test('they are a named list of buttons', async ({ story, page }) => {
    await story.open('chat-components-followupchips--default')
    const list = page.getByRole('list', { name: 'Suggested follow-ups' })
    await expect(list.getByRole('button')).toHaveCount(3)
  })

  test('while an answer is running they are disabled', async ({ story, page }) => {
    await story.open('chat-components-followupchips--disabled')
    for (const chip of await page.getByRole('button').all()) await expect(chip).toBeDisabled()
  })

  test('each chip is reachable with Tab, in order', async ({ story, page }) => {
    await story.open('chat-components-followupchips--default')
    await page
      .getByRole('button', { name: 'How many days of cover after the tax payment?' })
      .focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Who can approve a wire today?' })).toBeFocused()
  })

  test('one follow-up is still a list', async ({ story, page }) => {
    await story.open('chat-components-followupchips--single')
    await expect(
      page.getByRole('list', { name: 'Suggested follow-ups' }).getByRole('listitem'),
    ).toHaveCount(1)
  })
})
