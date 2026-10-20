import { expect, test } from '../../../tests/story'

for (const mode of ['light', 'dark'] as const) {
  for (const field of ['Find a filter…', 'Filter Accounts options']) {
    test(`${mode}: ${field} focus stays inside the scrolling rail`, async ({ story, page }) => {
      const root = await story.open('components-facetfilters--local-10000', { mode })
      await page.keyboard.press('Tab')
      const input = page.getByRole('textbox', { name: field, exact: true })
      await input.focus()
      await expect(input).toBeFocused()
      await expect
        .poll(() =>
          input.evaluate((el) => {
            const style = getComputedStyle(el)
            return Number.parseFloat(style.outlineOffset) + Number.parseFloat(style.outlineWidth)
          }),
        )
        .toBeLessThanOrEqual(0)
      const focus = await input.evaluate((el) => {
        const style = getComputedStyle(el)
        const width = Number.parseFloat(style.outlineWidth)
        const offset = Number.parseFloat(style.outlineOffset)
        const rect = el.getBoundingClientRect()
        const clips: boolean[] = []
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          const css = getComputedStyle(parent)
          if (/(auto|scroll|hidden|clip)/.test(`${css.overflowX} ${css.overflowY}`)) {
            const box = parent.getBoundingClientRect()
            clips.push(
              rect.left >= box.left &&
                rect.right <= box.right &&
                rect.top >= box.top &&
                rect.bottom <= box.bottom,
            )
          }
        }
        return {
          width,
          offset,
          style: style.outlineStyle,
          focusVisible: el.matches(':focus-visible'),
          className: el.className,
          inside: clips.every(Boolean),
        }
      })
      expect(focus.width).toBeGreaterThanOrEqual(2)
      expect(focus.offset + focus.width, JSON.stringify(focus)).toBeLessThanOrEqual(0)
      expect(focus.inside).toBe(true)
      await expect(root.locator(':scope > div').first()).toHaveScreenshot(
        `facet-${field.startsWith('Find') ? 'global' : 'group'}-focus-${mode}.png`,
      )
    })
  }
}

test('a consumer can hide optional facet chrome and keep selection working', async ({
  story,
  page,
}) => {
  const root = await story.open('components-facetfilters--minimal-controls')
  await expect(page.getByRole('textbox', { name: 'Find a filter…' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Hide unavailable' })).toHaveCount(0)
  await expect(root.getByText(/items in scope/)).toHaveCount(0)
  await expect(root.getByRole('button', { name: 'Clear all', exact: true })).toHaveCount(0)
  const picked = root.getByRole('checkbox', { name: /Operating/ }).first()
  await expect(picked).not.toHaveAccessibleName(/results/)
  await expect(picked).toBeChecked()
  await picked.uncheck()
  await expect(picked).not.toBeChecked()
})
