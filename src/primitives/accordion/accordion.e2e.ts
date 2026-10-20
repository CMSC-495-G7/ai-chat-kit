import { expect, test } from '../../../tests/story'

test.describe('Accordion', () => {
  test('a trigger opens and closes its panel', async ({ story, page }) => {
    await story.open('primitives-accordion--basic')
    const trigger = page.getByRole('button', { name: /^Access and roles/ })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('the keyboard toggles a panel', async ({ story, page }) => {
    await story.open('primitives-accordion--basic')
    const trigger = page.getByRole('button', { name: /^Single sign-on/ })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Space')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('each trigger names the region it controls', async ({ story, page }) => {
    await story.open('primitives-accordion--basic')
    const trigger = page.getByRole('button', { name: 'Data retention' })
    const panel = page.locator(`#${await trigger.getAttribute('aria-controls')}`)
    await expect(panel).toHaveRole('region')
    await expect(panel).toContainText('How long conversations are kept')
  })

  test('a host can open and close every panel at once', async ({ story, page }) => {
    await story.open('primitives-accordion--controlled')
    await page.getByRole('button', { name: 'Expand all' }).click()
    await expect(page.getByText('3 of 3 open')).toBeVisible()
    await page.getByRole('button', { name: 'Collapse all' }).click()
    await expect(page.getByText('0 of 3 open')).toBeVisible()
  })

  test('with one always open, the open panel cannot be closed', async ({ story, page }) => {
    await story.open('primitives-accordion--always-one-open')
    const first = page.getByRole('button', { name: 'Access and roles' })
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    const second = page.getByRole('button', { name: /^Data retention/ })
    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(first).toHaveAttribute('aria-expanded', 'false')
  })
})
