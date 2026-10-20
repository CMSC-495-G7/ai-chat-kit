import { expect, test } from '../../../tests/story'

test.describe('AmbientGlow', () => {
  test('it is hidden from assistive technology and never takes a click', async ({ story }) => {
    const root = await story.open('primitives-ambientglow--alone')
    const glow = root.locator('[aria-hidden="true"]').first()
    await expect(glow).toHaveCSS('pointer-events', 'none')
  })

  test('it fills the surface it sits behind', async ({ story }) => {
    const root = await story.open('primitives-ambientglow--behind-a-page')
    const glow = (await root.locator('[aria-hidden="true"]').first().boundingBox())!
    const page = (await root.locator('.relative').first().boundingBox())!
    expect([glow.width, glow.height]).toEqual([page.width, page.height])
  })

  test('content on top of it stays readable and clickable', async ({ story }) => {
    const root = await story.open('primitives-ambientglow--behind-solid-panels')
    const panel = root.getByText('A solid panel')
    await panel.click() // would time out if the glow were on top
    await expect(panel).toBeVisible()
  })
})
