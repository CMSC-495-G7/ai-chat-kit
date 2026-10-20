import { expect, test } from '../../../tests/story'

test.describe('Switch', () => {
  test('clicking it flips it', async ({ story, page }) => {
    await story.open('primitives-switch--playground')
    const toggle = page.getByRole('switch')
    await expect(toggle).toBeChecked()
    await toggle.click()
    await expect(toggle).not.toBeChecked()
  })

  test('Space flips it from the keyboard', async ({ story, page }) => {
    await story.open('primitives-switch--off')
    const toggle = page.getByRole('switch')
    await toggle.focus()
    await page.keyboard.press('Space')
    await expect(toggle).toBeChecked()
  })

  test('its description is part of its name, so the choice is clear without sight', async ({
    story,
    page,
  }) => {
    await story.open('primitives-switch--playground')
    await expect(page.getByRole('switch')).toHaveAccessibleName(/Show citations/)
  })

  test('with the label hidden it is still named', async ({ story, page }) => {
    await story.open('primitives-switch--hidden-label')
    await expect(page.getByRole('switch', { name: 'Show citations' })).toBeVisible()
  })

  test('disabled does not flip', async ({ story, page }) => {
    await story.open('primitives-switch--disabled')
    await expect(page.getByRole('switch')).toBeDisabled()
  })
})
