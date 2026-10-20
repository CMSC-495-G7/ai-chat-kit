import { expect, test } from '../../../tests/story'

test.describe('Icons', () => {
  test('every icon in the gallery is drawn and hidden from assistive technology', async ({
    story,
  }) => {
    const root = await story.open('primitives-icons--gallery')
    const icons = root.locator('li svg')
    expect(await icons.count()).toBeGreaterThan(60)
    const exposed = await icons.evaluateAll(
      (nodes) => nodes.filter((node) => node.getAttribute('aria-hidden') !== 'true').length,
    )
    expect(exposed).toBe(0)
  })

  test('the gallery filters by name', async ({ story, page }) => {
    const root = await story.open('primitives-icons--gallery')
    await page.getByRole('textbox', { name: 'Filter icons' }).fill('chevron')
    await expect(root.locator('li code')).toHaveText([
      'ChevronDownIcon',
      'ChevronLeftIcon',
      'ChevronRightIcon',
      'ChevronUpIcon',
    ])
  })

  test('an icon takes the size it is given', async ({ story }) => {
    const root = await story.open('primitives-icons--sizes')
    const widths = await root
      .locator('div.flex.items-center')
      .evaluateAll((rows) =>
        rows.map((row) => row.querySelector('svg')!.getBoundingClientRect().width),
      )
    expect(widths).toEqual([14, 16, 18, 20, 24])
  })

  test('an icon takes the colour of the text around it', async ({ story }) => {
    const root = await story.open('primitives-icons--tinted')
    const colours = await root
      .locator('div.flex.items-center')
      .evaluateAll((rows) => rows.map((row) => getComputedStyle(row.querySelector('svg')!).color))
    expect(new Set(colours).size).toBe(5)
  })

  test('alone in a button, the button names it', async ({ story, page }) => {
    await story.open('primitives-icons--with-and-without-a-label')
    await expect(page.getByRole('button', { name: 'Search chat' })).toBeVisible()
  })
})
