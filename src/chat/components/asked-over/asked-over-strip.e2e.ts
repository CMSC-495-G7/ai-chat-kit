import { expect, test } from '../../../../tests/story'

test.describe('AskedOverStrip', () => {
  test('it summarises the filters a question was asked over', async ({ story, page }) => {
    await story.open('chat-components-askedoverstrip--snapshot')
    const strip = page.getByRole('button', { name: 'Filters used: 12,408 items' })
    await expect(strip).toContainText('Last 90 days')
  })

  test('it opens to list every filter', async ({ story, page }) => {
    await story.open('chat-components-askedoverstrip--snapshot')
    await page.getByRole('button', { name: /^Filters used/ }).click()
    const root = page.locator('#storybook-root')
    await expect(root).toContainText('Searched over 12,408 items')
    await expect(root).toContainText(/Accounts:\s*Payroll/)
    await page.getByRole('button', { name: 'Hide the filters used' }).click()
    await expect(page.getByRole('button', { name: /^Filters used/ })).toBeVisible()
  })

  test('when the filters have changed since, its name says so', async ({ story, page }) => {
    await story.open('chat-components-askedoverstrip--changed-since')
    await expect(
      page.getByRole('button', { name: 'Filters used: 12,408 items, changed since' }),
    ).toBeVisible()
  })

  test('compact shows fewer chips and counts the rest', async ({ story, page }) => {
    await story.open('chat-components-askedoverstrip--compact')
    await expect(page.getByRole('button', { name: /^Filters used/ })).toContainText('+4')
  })
})
