import { expect, test } from '../../../tests/story'

test.describe('PillList', () => {
  test('shows `max` pills and folds the rest into a count', async ({ story, page }) => {
    await story.open('primitives-pilllist--playground')
    const list = page.getByRole('list')
    await expect(list.getByRole('listitem')).toHaveCount(4) // three pills and the count
    await expect(list.getByText('Chat', { exact: true })).toBeVisible()
    await expect(list.getByText('Ingestion', { exact: true })).toHaveCount(0)
    await expect(list.getByRole('button', { name: '4 more' })).toHaveText('+4')
  })

  test('max runs from zero to everything', async ({ story, page }) => {
    await story.open('primitives-pilllist--max-pills')
    const lists = page.getByRole('list')
    await expect(lists.nth(0).getByRole('listitem')).toHaveCount(1) // the count alone
    await expect(lists.nth(0).getByRole('button')).toHaveText('+7')
    await expect(lists.nth(1).getByRole('listitem')).toHaveCount(2)
    await expect(lists.nth(2).getByRole('listitem')).toHaveCount(4)
    await expect(lists.nth(3).getByRole('listitem')).toHaveCount(7) // no count
    await expect(lists.nth(3).getByRole('button')).toHaveCount(0)
  })

  test('past the cap the count reads 99+', async ({ story, page }) => {
    await story.open('primitives-pilllist--large-counts')
    const counts = page.getByRole('button')
    await expect(counts.nth(2)).toHaveText('+99')
    await expect(counts.nth(3)).toHaveText('99+')
    await expect(counts.nth(5)).toHaveText('99+')
  })

  test('hovering the list opens the hidden pills, outside the list, and leaving closes them', async ({
    story,
    page,
  }) => {
    await story.open('primitives-pilllist--playground')
    const list = page.getByRole('list')
    await list.hover()
    const card = page.locator('[data-pill-list-card]')
    await expect(card).toBeVisible()
    await expect(card.getByText('Ingestion', { exact: true })).toBeVisible()
    await expect(card.getByText('Chat', { exact: true })).toHaveCount(0)
    // Portalled: not inside the list it belongs to.
    await expect(list.locator('[data-pill-list-card]')).toHaveCount(0)
    await page.mouse.move(5, 700)
    await expect(card).toBeHidden()
  })

  test('keyboard focus on the count opens it, and Escape closes it', async ({ story, page }) => {
    await story.open('primitives-pilllist--playground')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.getByRole('button', { name: '4 more' }).focus()
    const card = page.locator('[data-pill-list-card]')
    await expect(card).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
  })

  test('a tap pins the card open until a press elsewhere', async ({ story, page }) => {
    await story.open('primitives-pilllist--playground')
    const count = page.getByRole('button', { name: '4 more' })
    await count.click()
    await page.mouse.move(5, 700) // the pointer leaves; the card stays
    const card = page.locator('[data-pill-list-card]')
    await page.waitForTimeout(400)
    await expect(card).toBeVisible()
    await expect(count).toHaveAttribute('aria-expanded', 'true')
    await page.mouse.click(5, 700)
    await expect(card).toBeHidden()
  })

  test('a long tag truncates and the count stays in the cell', async ({ story, page }) => {
    await story.open('primitives-pilllist--in-a-narrow-cell')
    const cell = page.getByRole('list').locator('xpath=..')
    const count = page.getByRole('button', { name: /more/ })
    const [box, cellBox] = await Promise.all([count.boundingBox(), cell.boundingBox()])
    expect(box!.x + box!.width).toBeLessThanOrEqual(cellBox!.x + cellBox!.width)
  })

  test('with no items it draws only what `empty` says', async ({ story, page }) => {
    const root = await story.open('primitives-pilllist--empty')
    await expect(root).toHaveText('No tags')
    await expect(page.getByRole('list')).toHaveCount(0)
  })
})
