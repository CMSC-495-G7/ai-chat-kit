import { expect, test } from '../../../tests/story'

test.describe('Card', () => {
  test('a card is a region named by its title', async ({ story, page }) => {
    await story.open('primitives-card--playground')
    const card = page.getByRole('region', { name: 'Recently visited' })
    await expect(card.getByRole('heading', { name: 'Recently visited' })).toBeVisible()
  })

  test('with an href the title is the link', async ({ story, page }) => {
    await story.open('primitives-card--as-link')
    await expect(page.getByRole('link', { name: 'Data retention policy' })).toHaveAttribute(
      'href',
      '#retention',
    )
  })

  test('the arrow keys move a draggable card ten pixels at a time', async ({ story, page }) => {
    await story.open('primitives-card--draggable')
    const position = page.getByRole('status')
    await expect(position).toHaveText('10, 10')
    await page.getByRole('button', { name: 'Move card' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(position).toHaveText('20, 10')
    await page.keyboard.press('ArrowDown')
    await expect(position).toHaveText('20, 20')
  })

  test('the actions button opens the card menu', async ({ story, page }) => {
    await story.open('primitives-card--anatomy')
    const more = page.getByRole('button', { name: 'More card actions' })
    await more.click()
    await expect(more).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(more).toHaveAttribute('aria-expanded', 'false')
  })

  test('a grid of cards exposes each as its own region', async ({ story, page }) => {
    await story.open('primitives-card--grid')
    await expect(page.getByRole('region')).toHaveCount(3)
  })
})
