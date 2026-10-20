import { expect, test } from '../../../../tests/story'

test.describe('ReferencePanel', () => {
  test('the references are tabs, and choosing one shows that source', async ({ story, page }) => {
    const root = await story.open('chat-components-referencepanel--back-button')
    const tabs = page.getByRole('tablist', { name: 'References' })
    await expect(tabs.getByRole('tab', { name: '1' })).toHaveAttribute('aria-selected', 'true')
    await expect(root).toContainText('Treasury liquidity policy (2026)')
    await tabs.getByRole('tab', { name: '2' }).click()
    await expect(tabs.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true')
    await expect(root).not.toContainText('Treasury liquidity policy (2026)')
  })

  test('Next and Previous step through, and stop at the ends', async ({ story, page }) => {
    await story.open('chat-components-referencepanel--back-button')
    const previous = page.getByRole('button', { name: 'Previous reference' })
    const next = page.getByRole('button', { name: 'Next reference' })
    await expect(previous).toBeDisabled()
    await next.click()
    await expect(previous).toBeEnabled()
    await next.click()
    await expect(next).toBeDisabled()
  })

  test('the cited passages are marked in the source', async ({ story }) => {
    const root = await story.open('chat-components-referencepanel--back-button')
    await expect(root.locator('mark').first()).toHaveText('at least 30 days')
  })

  test('a source with a file links to the original', async ({ story, page }) => {
    await story.open('chat-components-referencepanel--back-button')
    await expect(
      page.getByRole('link', { name: 'Open original document: Treasury liquidity policy (2026)' }),
    ).toHaveAttribute('href', /liquidity-2026\.pdf$/)
  })

  test('many references still fit: the tab list scrolls', async ({ story, page }) => {
    await story.open('chat-components-referencepanel--many-references')
    const tabs = page.getByRole('tablist', { name: 'References' })
    expect(await tabs.getByRole('tab').count()).toBeGreaterThan(10)
    await expect(page.getByRole('button', { name: 'Close references' })).toBeVisible()
  })

  test('without popOut there is no pop-out button', async ({ story, page }) => {
    await story.open('chat-components-referencepanel--with-original')
    await expect(page.getByRole('tab', { name: 'Original' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open original in a pop-up' })).toHaveCount(0)
  })

  test('the pop-out button opens the original in a dialog named for the source', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-referencepanel--with-pop-out')
    // Offered from the excerpt too: the reader needn't switch views first.
    await expect(page.getByRole('tab', { name: 'Excerpt' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.getByRole('button', { name: 'Open original in a pop-up' }).click()
    const dialog = page.getByRole('dialog', { name: 'Treasury liquidity policy (2026)' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('canvas').first()).toBeVisible({ timeout: 20_000 })
    await expect(dialog.getByText('Page 1 of 3')).toBeVisible()
  })

  test('the dialog expands, and its zoom leaves the panel’s alone', async ({ story, page }) => {
    await story.open('chat-components-referencepanel--with-pop-out')
    await page.getByRole('tab', { name: 'Original' }).click()
    await page.getByRole('button', { name: 'Open original in a pop-up' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('canvas').first()).toBeVisible({ timeout: 20_000 })

    const width = async () => (await dialog.getByRole('group').boundingBox())!.width
    const before = await width()
    await dialog.getByRole('button', { name: 'Expand original' }).click()
    await expect.poll(width).toBeGreaterThan(before)

    await dialog.getByRole('button', { name: 'Zoom in' }).click()
    await expect(dialog.getByText('125%')).toBeVisible()
    await dialog.getByRole('button', { name: 'Close original' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByText('100%')).toBeVisible()
  })

  test('Escape closes the dialog and leaves the panel on its reference', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-referencepanel--with-pop-out')
    const opener = page.getByRole('button', { name: 'Open original in a pop-up' })
    await opener.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // An arrow key in the dialog must not turn the panel to the next reference.
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(
      page.getByRole('tablist', { name: 'References' }).getByRole('tab', { name: '1' }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(opener).toBeFocused()
  })

  test('a source with no original has no pop-out button either', async ({ story, page }) => {
    await story.open('chat-components-referencepanel--with-pop-out')
    await page.getByRole('tablist', { name: 'References' }).getByRole('tab', { name: '2' }).click()
    await expect(page.getByRole('button', { name: 'Open original in a pop-up' })).toHaveCount(0)
  })
})
