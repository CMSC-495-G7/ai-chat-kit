import { expect, test } from '../../../tests/story'

test.describe('Menu', () => {
  test('it is a named menu of menu items', async ({ story, page }) => {
    await story.open('primitives-menu--with-hints')
    const menu = page.getByRole('menu', { name: 'Account' })
    await expect(menu.getByRole('menuitem')).toHaveCount(2)
  })

  test('the arrow keys move between items and wrap, skipping a disabled one', async ({
    story,
    page,
  }) => {
    await story.open('primitives-menu--labels-only')
    const item = (name: string | RegExp) => page.getByRole('menuitem', { name })
    await item('Rename').focus()
    await page.keyboard.press('ArrowDown')
    await expect(item(/Mark as reviewed/)).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(item('Delete')).toBeFocused() // Archive is disabled
    await page.keyboard.press('ArrowDown')
    await expect(item('Rename')).toBeFocused()
    await page.keyboard.press('End')
    await expect(item('Delete')).toBeFocused()
    await page.keyboard.press('Home')
    await expect(item('Rename')).toBeFocused()
  })

  test('in a popover, choosing an item closes it', async ({ story, page }) => {
    await story.open('primitives-menu--in-a-popover')
    const trigger = page.getByRole('button', { name: 'Actions' })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('menuitem', { name: 'Rename' }).click()
    await expect(page.getByRole('menu')).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
