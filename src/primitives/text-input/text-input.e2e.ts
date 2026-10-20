import { expect, test } from '../../../tests/story'

test.describe('TextInput', () => {
  test('it takes typing', async ({ story, page }) => {
    await story.open('primitives-textinput--playground')
    const input = page.getByRole('textbox', { name: 'Tenant name' })
    await input.fill('Crestview Bank')
    await expect(input).toHaveValue('Crestview Bank')
  })

  test('the clear button empties a search field', async ({ story, page }) => {
    await story.open('primitives-textinput--search-with-clear')
    const input = page.getByRole('textbox', { name: 'Search tenants' })
    await expect(input).toHaveValue('crestview')
    await page.getByRole('button', { name: 'Clear tenant search' }).click()
    await expect(input).toHaveValue('')
  })

  test('invalid and disabled are reported', async ({ story, page }) => {
    await story.open('primitives-textinput--invalid')
    await expect(page.getByRole('textbox', { name: 'Tenant name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await story.open('primitives-textinput--disabled')
    await expect(page.getByRole('textbox', { name: 'Tenant name' })).toBeDisabled()
  })

  test('the three sizes are 32, 36 and 44 pixels tall', async ({ story, page }) => {
    await story.open('primitives-textinput--sizes')
    const heights = []
    for (const placeholder of ['Small', 'Medium', 'Large']) {
      const box = await page.getByPlaceholder(placeholder).locator('xpath=..').boundingBox()
      heights.push(box?.height)
    }
    expect(heights).toEqual([32, 36, 44])
  })

  test('a valid value is confirmed in a status the field is described by', async ({
    story,
    page,
  }) => {
    await story.open('primitives-textinput--valid')
    await expect(page.getByRole('status')).toHaveText('Tenant name is available.')
  })
})

test('inset focus stays visible inside a clipped container', async ({ story, page }) => {
  await story.open('primitives-textinput--inset-focus')
  await page.keyboard.press('Tab')
  const input = page.getByRole('textbox', { name: 'Tenant name' })
  await input.focus()
  await expect(input).toBeFocused()
  await expect
    .poll(() => input.locator('..').evaluate((el) => getComputedStyle(el).boxShadow))
    .toContain('inset')
})
