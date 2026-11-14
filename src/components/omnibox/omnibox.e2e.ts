import { expect, test } from '../../../tests/story'

test.describe('Omnibox', () => {
  test('it is a combobox named by its label', async ({ story, page }) => {
    await story.open('components-omnibox--empty')
    await expect(page.getByRole('combobox', { name: 'Search and filter tenants' })).toBeVisible()
  })

  test('each chip can be removed by a button that names it', async ({ story, page }) => {
    await story.open('components-omnibox--with-chips')
    await page.getByRole('button', { name: 'Remove status:Active' }).click()
    await expect(page.getByRole('button', { name: 'Remove status:Active' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Remove tier:Enterprise' })).toBeVisible()
  })

  test('Backspace in an empty field removes the last chip', async ({ story, page }) => {
    await story.open('components-omnibox--with-chips')
    await page.getByRole('combobox', { name: 'Search and filter tenants' }).focus()
    await page.keyboard.press('Backspace')
    await expect(page.getByRole('button', { name: 'Remove tier:Enterprise' })).toHaveCount(0)
  })

  test('typing a field name offers it as a suggestion', async ({ story, page }) => {
    await story.open('components-omnibox--empty')
    const box = page.getByRole('combobox', { name: 'Search and filter tenants' })
    await box.fill('sta')
    await expect(box).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('option').first()).toBeVisible()
  })

  test('chips wrap onto more lines and the field grows, instead of running off the edge', async ({
    story,
    page,
  }) => {
    await page.setViewportSize({ width: 700, height: 600 })
    await story.open('components-omnibox--many-chips')
    const box = page.getByRole('combobox', { name: 'Search and filter tenants' })
    const field = await box.locator('xpath=ancestor::div[1]').boundingBox()
    expect(field!.height, 'taller than a single line').toBeGreaterThan(80)
    for (const remove of await page.getByRole('button', { name: /^Remove / }).all()) {
      const b = (await remove.boundingBox())!
      expect(b.x + b.width, 'every remove button stays inside the field').toBeLessThanOrEqual(
        field!.x + field!.width + 1,
      )
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  })

  test('a chip longer than the field is shortened, keeps its remove button, and shows all of it on hover', async ({
    story,
    page,
  }) => {
    await story.open('components-omnibox--many-chips')
    const field = (await page
      .getByRole('combobox', { name: 'Search and filter tenants' })
      .locator('xpath=ancestor::div[1]')
      .boundingBox())!
    const chip = page.getByTitle(/^search: a search term that goes on far longer/)
    const chipBox = (await chip.boundingBox())!
    expect(chipBox.width).toBeLessThanOrEqual(field.width)
    const remove = (await chip.getByRole('button', { name: /^Remove / }).boundingBox())!
    expect(remove.x + remove.width).toBeLessThanOrEqual(field.x + field.width + 1)
  })

  test('with quick picks, focusing the empty field shows them and typing swaps them for suggestions', async ({
    story,
    page,
  }) => {
    await story.open('components-omnibox--quick-picks')
    const box = page.getByRole('combobox', { name: 'Search and filter tenants' })
    await expect(page.getByRole('group', { name: 'Search and filter tenants' })).toHaveCount(0)
    await box.click()
    await expect(page.getByRole('group', { name: 'Search and filter tenants' })).toBeVisible()
    await box.fill('a')
    await expect(page.getByRole('group', { name: 'Search and filter tenants' })).toHaveCount(0)
    await expect(page.getByRole('option').first()).toBeVisible()
  })

  test('a quick pick can close the dropdown, and Escape from the picks returns to the field', async ({
    story,
    page,
  }) => {
    await story.open('components-omnibox--quick-picks')
    const box = page.getByRole('combobox', { name: 'Search and filter tenants' })
    await box.click()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('group', { name: 'Search and filter tenants' })).toHaveCount(0)
    await box.click()
    await box.press('ArrowDown')
    await expect(page.getByRole('button', { name: '7D' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(box).toBeFocused()
    await expect(page.getByRole('group', { name: 'Search and filter tenants' })).toHaveCount(0)
  })

  test('the shortcut letter focuses the field with Ctrl or Command held', async ({
    story,
    page,
  }) => {
    await story.open('components-omnibox--quick-picks')
    const box = page.getByRole('combobox', { name: 'Search and filter tenants' })
    // The listener is attached just after the first paint, so keep pressing until it is there.
    await expect(async () => {
      await page.keyboard.press('Control+k')
      await expect(box).toBeFocused({ timeout: 300 })
    }).toPass()
  })

  test('with no shortcut set, the letter does nothing', async ({ story, page }) => {
    await story.open('components-omnibox--empty')
    await page.keyboard.press('Control+k')
    await expect(
      page.getByRole('combobox', { name: 'Search and filter tenants' }),
    ).not.toBeFocused()
  })
})
