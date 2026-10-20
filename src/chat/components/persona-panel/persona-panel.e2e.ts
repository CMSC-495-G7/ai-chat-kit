import { expect, test } from '../../../../tests/story'

test.describe('PersonaPanel', () => {
  test('choosing a persona changes the hint under it', async ({ story, page }) => {
    const root = await story.open('chat-components-personapanel--default')
    await expect(root).toContainText('Warm, guided answers')
    await page.getByRole('combobox', { name: 'Persona' }).selectOption({ label: 'Analyst' })
    await expect(root).toContainText('Numbers first, cited')
  })

  test('the prompt layers are listed in priority order', async ({ story, page }) => {
    await story.open('chat-components-personapanel--default')
    await expect(page.getByRole('listitem')).toHaveText([
      /^1\s*Base persona/,
      /^2\s*Compliance/,
      /^3\s*Session context/,
    ])
  })

  test('the layers can be read and selected but not edited', async ({ story, page }) => {
    await story.open('chat-components-personapanel--default')
    const layer = page.getByRole('textbox', { name: '1 Base persona' })
    await expect(layer).toHaveAttribute('readonly', '')
    const before = await layer.inputValue()
    await layer.focus()
    await page.keyboard.type('x')
    await expect(layer).toHaveValue(before)
  })

  test('with no layers there is no empty list', async ({ story, page }) => {
    await story.open('chat-components-personapanel--no-templates')
    await expect(page.getByRole('combobox', { name: 'Persona' })).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(0)
  })
})
