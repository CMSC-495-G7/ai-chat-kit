import { expect, test } from '../../../tests/story'

test.describe('Pill', () => {
  test('a plain pill is text, not a control', async ({ story }) => {
    const root = await story.open('primitives-pill--playground')
    await expect(root).toHaveText('Active')
    await expect(root.getByRole('button')).toHaveCount(0)
  })

  test('with onClick the whole pill is a button', async ({ story, page }) => {
    await story.open('primitives-pill--actionable')
    await expect(page.getByRole('button', { name: 'Clickable chip' })).toBeVisible()
  })

  test('a closable pill has a remove button named for it', async ({ story, page }) => {
    await story.open('primitives-pill--closable')
    for (const colour of ['green', 'orange', 'yellow', 'red']) {
      await expect(page.getByRole('button', { name: `Remove ${colour} chip` })).toBeVisible()
    }
  })

  test('the three sizes are 24, 32 and 36 pixels tall', async ({ story, page }) => {
    await story.open('primitives-pill--sizes')
    const heights = []
    for (const name of ['Small', 'Medium', 'Large']) {
      const pill = page.getByText(name, { exact: true })
      heights.push(
        await pill.evaluate((node) => {
          let element: Element | null = node
          while (element && !/\brounded-control\b/.test(element.className))
            element = element.parentElement
          return element?.getBoundingClientRect().height
        }),
      )
    }
    expect(heights).toEqual([24, 32, 36])
  })
})
