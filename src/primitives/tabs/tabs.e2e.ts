import { expect, test } from '../../../tests/story'

test.describe('Tabs', () => {
  test('clicking a tab selects it and shows its panel', async ({ story, page }) => {
    await story.open('primitives-tabs--line')
    await page.getByRole('tab', { name: 'Details' }).click()
    await expect(page.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tabpanel', { name: 'Details' })).toBeVisible()
    await expect(page.getByRole('tabpanel', { name: 'Card elements' })).toBeHidden()
  })

  test('the arrow keys move along the list and select as they go', async ({ story, page }) => {
    await story.open('primitives-tabs--line')
    await page.getByRole('tab', { name: 'Card elements' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.keyboard.press('End')
    // The last tab is disabled, so End lands on the last one that can be chosen.
    await expect(page.getByRole('tab', { name: 'Activity' })).toBeFocused()
  })

  test('with manual activation an arrow only moves focus; Enter selects', async ({
    story,
    page,
  }) => {
    await story.open('primitives-tabs--manual-activation')
    await page.getByRole('tab', { name: 'Card elements' }).focus()
    await page.keyboard.press('ArrowRight')
    const details = page.getByRole('tab', { name: 'Details' })
    await expect(details).toBeFocused()
    await expect(details).toHaveAttribute('aria-selected', 'false')
    await page.keyboard.press('Enter')
    await expect(details).toHaveAttribute('aria-selected', 'true')
  })

  test('a disabled tab cannot be selected', async ({ story, page }) => {
    await story.open('primitives-tabs--line')
    await expect(page.getByRole('tab', { name: 'Disabled' })).toBeDisabled()
  })

  test('a vertical list is driven by Up and Down', async ({ story, page }) => {
    await story.open('primitives-tabs--vertical')
    const list = page.getByRole('tablist', { name: 'Settings sections' })
    await expect(list).toHaveAttribute('aria-orientation', 'vertical')
    await page.getByRole('tab', { name: /^Access and roles/ }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('tab', { name: 'Single sign-on' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('only the selected tab is in the tab order', async ({ story, page }) => {
    await story.open('primitives-tabs--segmented')
    await expect(page.getByRole('tab', { name: '30 days' })).toHaveAttribute('tabindex', '0')
    await expect(page.getByRole('tab', { name: '7 days' })).toHaveAttribute('tabindex', '-1')
  })
})
