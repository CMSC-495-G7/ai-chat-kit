import { expect, test } from '../../../tests/story'
import type { Page } from '@playwright/test'

const open = async (page: Page) => {
  const trigger = page.getByRole('button', { name: /^Open/ })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: 'Example panel' })
  await expect(panel).toBeVisible()
  return { trigger: page.getByRole('button', { name: /^(Open|Close) ·/ }), panel }
}

test.describe('Popover', () => {
  test('Escape closes it and returns focus to its anchor', async ({ story, page }) => {
    await story.open('primitives-popover--start')
    const { trigger, panel } = await open(page)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('a press outside closes it', async ({ story, page }) => {
    await story.open('primitives-popover--start')
    const { panel } = await open(page)
    await page.mouse.click(900, 600)
    await expect(panel).toBeHidden()
  })

  test('a press inside does not', async ({ story, page }) => {
    await story.open('primitives-popover--start')
    const { panel } = await open(page)
    await panel.getByText('A panel').click()
    await expect(panel).toBeVisible()
  })

  test('start lines up with the left edge of the anchor, below it', async ({ story, page }) => {
    await story.open('primitives-popover--start')
    const { trigger, panel } = await open(page)
    const [a, p] = [(await trigger.boundingBox())!, (await panel.boundingBox())!]
    expect(Math.abs(p.x - a.x)).toBeLessThan(2)
    expect(p.y).toBeGreaterThan(a.y + a.height)
  })

  test('end lines up with the right edge of the anchor', async ({ story, page }) => {
    await story.open('primitives-popover--end')
    const { trigger, panel } = await open(page)
    const [a, p] = [(await trigger.boundingBox())!, (await panel.boundingBox())!]
    expect(Math.abs(p.x + p.width - (a.x + a.width))).toBeLessThan(2)
  })

  test('side opens beside the anchor, level with its top', async ({ story, page }) => {
    await story.open('primitives-popover--side')
    const { trigger, panel } = await open(page)
    const [a, p] = [(await trigger.boundingBox())!, (await panel.boundingBox())!]
    expect(p.x).toBeGreaterThan(a.x + a.width)
    expect(Math.abs(p.y - a.y)).toBeLessThan(2)
  })

  test('above rises from the anchor', async ({ story, page }) => {
    await story.open('primitives-popover--above')
    const { trigger, panel } = await open(page)
    const [a, p] = [(await trigger.boundingBox())!, (await panel.boundingBox())!]
    expect(p.y + p.height).toBeLessThan(a.y)
  })
})
