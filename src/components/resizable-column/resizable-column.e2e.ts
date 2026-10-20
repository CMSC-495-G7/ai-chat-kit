import { expect, test } from '../../../tests/story'
import type { Page } from '@playwright/test'

const drag = async (page: Page, by: number) => {
  const handle = (await page.getByRole('separator').boundingBox())!
  const x = handle.x + handle.width / 2
  const y = handle.y + handle.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + by, y, { steps: 6 })
  await page.mouse.up()
}
const width = async (page: Page) =>
  (await page.getByText('Reference panel', { exact: true }).locator('xpath=../..').boundingBox())!
    .width

test.describe('ResizableColumn', () => {
  test('dragging the handle left widens the column', async ({ story, page }) => {
    await story.open('components-resizablecolumn--default')
    const before = await width(page)
    await drag(page, -120)
    await expect.poll(() => width(page)).toBeGreaterThan(before + 100)
    expect(await width(page)).toBeLessThan(before + 140)
  })

  test('it never shrinks below its minimum', async ({ story, page }) => {
    await story.open('components-resizablecolumn--default')
    await drag(page, 600)
    await expect.poll(() => width(page)).toBe(240)
  })

  test('it never takes the space its neighbour needs', async ({ story, page }) => {
    await story.open('components-resizablecolumn--default')
    await drag(page, -2000)
    await expect.poll(() => width(page)).toBeGreaterThan(600)
    const chat = (await page.getByText('Chat column').locator('xpath=..').boundingBox())!
    expect(chat.width).toBeGreaterThanOrEqual(280)
  })

  test('with a storage key the width survives a reload', async ({ story, page }) => {
    await story.open('components-resizablecolumn--persisted')
    await drag(page, -80)
    await expect.poll(() => width(page)).toBeGreaterThan(400)
    const dragged = await width(page)
    await page.reload()
    await expect.poll(() => width(page)).toBe(dragged)
    await page.evaluate(() => localStorage.removeItem('storybook-resizable-column'))
  })
})
