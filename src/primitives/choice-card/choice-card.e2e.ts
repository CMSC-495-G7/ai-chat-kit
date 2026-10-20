import { expect, test } from '../../../tests/story'

test.describe('ChoiceCard', () => {
  test('radio cards let one choice stand at a time', async ({ story, page }) => {
    await story.open('primitives-choicecard--radio-group')
    const group = page.getByRole('group', { name: 'Financing product' })
    // The whole card is the control: its input covers it, so a click anywhere lands.
    await group.getByRole('radio', { name: 'Line of credit' }).click()
    await expect(group.getByRole('radio', { name: 'Line of credit' })).toBeChecked()
    await expect(group.getByRole('radio', { name: 'Home equity' })).not.toBeChecked()
  })

  test('a disabled card cannot be chosen', async ({ story, page }) => {
    await story.open('primitives-choicecard--radio-group')
    await expect(page.getByRole('radio', { name: 'Refinance' })).toBeDisabled()
  })

  test('the arrow keys move between radio cards', async ({ story, page }) => {
    await story.open('primitives-choicecard--without-icons')
    await page.getByRole('radio', { name: 'Monthly' }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('radio', { name: 'Annual' })).toBeChecked()
  })

  test('checkbox cards toggle independently', async ({ story, page }) => {
    await story.open('primitives-choicecard--checkbox-group')
    const search = page.getByRole('checkbox', { name: 'Web search' })
    await search.check()
    await expect(search).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Citations' })).toBeChecked()
  })
})
