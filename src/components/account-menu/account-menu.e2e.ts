import { expect, test } from '../../../tests/story'

test.describe('AccountMenu', () => {
  test('the avatar opens a panel that says who is signed in', async ({ story, page }) => {
    await story.open('components-account-menu--avatar')
    const trigger = page.getByRole('button', { name: 'Account: John Ozzo' })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panel = page.getByRole('dialog', { name: 'Account' })
    await expect(panel).toContainText('John Ozzo')
    await expect(panel.getByRole('menuitem')).toHaveCount(2)
  })

  test('choosing an entry closes the menu', async ({ story, page }) => {
    await story.open('components-account-menu--avatar')
    await page.getByRole('button', { name: 'Account: John Ozzo' }).click()
    await page.getByRole('menuitem', { name: /User settings/ }).click()
    await expect(page.getByRole('dialog', { name: 'Account' })).toBeHidden()
  })

  test('Escape closes it and returns focus to the avatar', async ({ story, page }) => {
    await story.open('components-account-menu--avatar')
    const trigger = page.getByRole('button', { name: 'Account: John Ozzo' })
    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Account' })).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('as a row at the foot of a panel it opens upward', async ({ story, page }) => {
    await story.open('components-account-menu--row')
    const trigger = page.getByRole('button', { name: 'Account: John Ozzo' })
    await expect(trigger).toContainText('Performance plan')
    await trigger.click()
    const [row, panel] = [
      (await trigger.boundingBox())!,
      (await page.getByRole('dialog', { name: 'Account' }).boundingBox())!,
    ]
    expect(panel.y + panel.height).toBeLessThanOrEqual(row.y)
  })

  test('collapsed, the row shows only the avatar but keeps its name', async ({ story, page }) => {
    await story.open('components-account-menu--collapsed-row')
    const trigger = page.getByRole('button', { name: 'Account: John Ozzo' })
    await expect(trigger.getByText('Performance plan')).toBeHidden()
  })
})
