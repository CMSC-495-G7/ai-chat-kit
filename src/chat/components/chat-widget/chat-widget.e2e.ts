import { expect, test } from '../../../../tests/story'
import { createPalette, parseHex } from '../../../lib/palette'

test.describe('ChatWidget', () => {
  test('the launcher opens the chat panel, a named dialog', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    const panel = page.getByRole('dialog', { name: 'Assistant chat' })
    await expect(panel.getByRole('textbox', { name: 'Message Assistant' })).toBeVisible()
    // The page's h1 belongs to the host, so the panel's greeting is an h2.
    await expect(
      panel.getByRole('heading', { level: 2, name: /What are we working on\?/ }),
    ).toContainText(', Dana.')
  })

  test('the panel header names the person signed in and offers the three window controls', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    const header = page.getByRole('dialog', { name: 'Assistant chat' }).getByRole('banner')
    await expect(header).toContainText('Dana Whitfield')
    for (const name of ['Expand panel', 'Minimize chat', 'Close chat and end conversation']) {
      await expect(header.getByRole('button', { name })).toBeVisible()
    }
  })

  test('Send is disabled until there is something to send', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    const send = page.getByRole('button', { name: 'Send message' })
    await expect(send).toBeDisabled()
    await page.getByRole('textbox', { name: 'Message Assistant' }).fill('Hello')
    await expect(send).toBeEnabled()
  })

  test('asking a question gets an answer in the panel', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    const box = page.getByRole('textbox', { name: 'Message Assistant' })
    await box.fill('Are our operating accounts within the liquidity policy?')
    await box.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Assistant chat' })).toContainText(
      'Are our operating accounts within the liquidity policy?',
    )
    await expect(
      page
        .getByRole('button', { name: 'Stop response' })
        .or(page.getByRole('button', { name: 'Send message' })),
    ).toBeVisible()
  })

  test('with side panels, the rail is a tab list that opens them', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--bottom-right')
    const panel = page.getByRole('dialog', { name: 'Assistant chat' })
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    await panel.getByRole('tab', { name: 'Persona' }).click()
    await expect(panel.getByRole('combobox', { name: 'Persona' })).toBeVisible()
  })

  test('starters are offered in the empty panel', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--with-starters')
    const panel = page.getByRole('dialog', { name: 'Assistant chat' })
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    await expect(panel.getByRole('button', { name: 'What changed since Friday?' })).toBeVisible()
  })

  test('closed, the panel cannot be reached with the keyboard', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    // Nothing has been opened: Tab should find the launcher and nothing inside the panel.
    const panel = page.getByRole('dialog', { name: 'Assistant chat' })
    for (let press = 0; press < 6; press++) {
      await page.keyboard.press('Tab')
      expect(await panel.evaluate((node) => node.contains(document.activeElement))).toBe(false)
    }
  })

  test('a custom palette re-themes the widget from one seed colour', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--custom-palette')
    const root = page.locator('[data-chat-overlay-root]')
    await expect(root).toHaveClass(/chat-theme-custom/)
    await page.getByRole('button', { name: 'Ask Assistant' }).click()
    await page.getByRole('textbox', { name: 'Message Assistant' }).fill('Hello')
    // The send button is the one --action fill; in light mode that is the
    // brand's solid 600 step.
    const [r, g, b] = parseHex(createPalette({ brand: '#0f766e' })['--brand-600'])
    const rgb = `rgb(${[r, g, b].map((v) => Math.round(v * 255)).join(', ')})`
    await expect(page.getByRole('button', { name: 'Send message' })).toHaveCSS(
      'background-color',
      rgb,
    )
  })
})
