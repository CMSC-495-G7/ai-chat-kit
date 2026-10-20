import { expect, test } from '../../../tests/story'

test.describe('Settings', () => {
  test('feature toggles are switches grouped under headings', async ({ story, page }) => {
    await story.open('components-settings--toggles')
    await expect(page.getByRole('heading', { name: 'Before you ask' })).toBeVisible()
    const toggle = page.getByRole('switch', { name: /^Tool calls/ })
    await expect(toggle).not.toBeChecked()
    await toggle.click()
    await expect(toggle).toBeChecked()
  })

  test('a locked toggle cannot be changed and says why', async ({ story, page }) => {
    await story.open('components-settings--toggles')
    const locked = page.getByRole('switch', { name: /^Audit trail/ })
    await expect(locked).toBeDisabled()
    await expect(locked).toHaveAccessibleName(/Required by your organisation/)
  })

  test('the palette picker is a radio group, one choice at a time', async ({ story, page }) => {
    await story.open('components-settings--palette')
    const group = page.getByRole('radiogroup', { name: 'Palette' })
    await group.getByRole('radio', { name: 'Graphite' }).click()
    await expect(group.getByRole('radio', { name: 'Graphite' })).toBeChecked()
    await expect(group.getByRole('radio', { name: 'Navy' })).not.toBeChecked()
  })

  test('the highlight picker offers six swatches, each named', async ({ story, page }) => {
    await story.open('components-settings--highlight')
    const group = page.getByRole('radiogroup', { name: 'Citation highlight' })
    await expect(group.getByRole('radio')).toHaveCount(6)
    await group.getByRole('radio', { name: 'Teal' }).click()
    await expect(group.getByRole('radio', { name: 'Teal' })).toBeChecked()
  })
})
