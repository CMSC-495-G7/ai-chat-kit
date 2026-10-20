import { expect, test } from '../../../tests/story'

test.describe('Avatar', () => {
  test('an image carries the person as its name', async ({ story, page }) => {
    await story.open('primitives-avatar--image')
    await expect(page.getByRole('img', { name: 'Dana Whitfield' })).toBeVisible()
  })

  test('an icon avatar is named by its label', async ({ story, page }) => {
    await story.open('primitives-avatar--icon')
    await expect(page.getByRole('img', { name: 'Unassigned user' })).toBeVisible()
  })

  test('with onClick it is a button', async ({ story, page }) => {
    await story.open('primitives-avatar--clickable')
    const button = page.getByRole('button', { name: "Open Christian's profile" })
    await expect(button).toHaveText('CS')
    await button.focus()
    await expect(button).toBeFocused()
  })

  test('it is a circle by default and a rounded square on request', async ({ story, page }) => {
    const radius = async (text: string) => {
      const box = page.getByText(text, { exact: true }).first()
      return box.evaluate((element) => {
        const style = getComputedStyle(element)
        return parseFloat(style.borderTopLeftRadius) / element.getBoundingClientRect().width
      })
    }
    await story.open('primitives-avatar--playground')
    expect(await radius('CS')).toBeGreaterThanOrEqual(0.5)
    await story.open('primitives-avatar--square')
    expect(await radius('AT')).toBeLessThan(0.5)
  })
})
