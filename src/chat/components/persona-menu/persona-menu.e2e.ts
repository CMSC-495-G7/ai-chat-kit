import { expect, test } from '../../../../tests/story'

test.describe('PersonaMenu', () => {
  test('the trigger names the persona in force', async ({ story, page }) => {
    await story.open('chat-components-personamenu--pill')
    await expect(page.getByRole('button', { name: 'Persona: Analyst' })).toBeVisible()
  })

  test('it opens a listbox and choosing an option changes the persona', async ({ story, page }) => {
    await story.open('chat-components-personamenu--pill')
    const trigger = page.getByRole('button', { name: 'Persona: Analyst' })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('option', { name: /^Brief/ }).click()
    await expect(page.getByRole('button', { name: 'Persona: Brief' })).toBeVisible()
    await expect(page.getByRole('listbox')).toHaveCount(0)
  })

  test('a press outside closes it without choosing', async ({ story, page }) => {
    await story.open('chat-components-personamenu--pill')
    await page.getByRole('button', { name: 'Persona: Analyst' }).click()
    await page.mouse.click(900, 80)
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Persona: Analyst' })).toBeVisible()
  })

  test('compact is an icon that keeps the same name', async ({ story, page }) => {
    await story.open('chat-components-personamenu--compact')
    const trigger = page.getByRole('button', { name: 'Persona: Analyst' })
    expect((await trigger.boundingBox())!.width).toBeLessThan(40)
  })

  test('in a narrow composer the pill gives way to an icon on its own', async ({ story, page }) => {
    await story.open('chat-components-personamenu--in-a-narrow-composer')
    const trigger = page.getByRole('button', { name: 'Persona: Analyst' })
    await expect(trigger).toHaveCount(1) // only one of the two triggers is exposed
    expect((await trigger.boundingBox())!.width).toBeLessThan(48)
  })
})
