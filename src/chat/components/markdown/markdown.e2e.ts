import { expect, test } from '../../../../tests/story'

test.describe('Markdown', () => {
  test('it draws the usual structures as real elements', async ({ story, page }) => {
    await story.open('chat-components-markdown--gfm')
    await expect(page.getByRole('heading', { name: 'Everything GFM' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('blockquote')).toBeVisible()
    await expect(page.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })

  test('task list boxes show state but cannot be changed', async ({ story, page }) => {
    await story.open('chat-components-markdown--gfm')
    for (const box of await page.getByRole('checkbox').all()) await expect(box).toBeDisabled()
  })

  test('a marker with no matching source is left as text', async ({ story, page }) => {
    const root = await story.open('chat-components-markdown--gfm')
    await expect(root).toContainText('[sic]')
    await expect(page.getByRole('button', { name: /^Open reference/ })).toHaveCount(0)
  })

  test('a mermaid fence becomes a diagram', async ({ story, page }) => {
    await story.open('chat-components-markdown--mermaid')
    await expect(page.getByRole('img', { name: 'Flowchart' }).first()).toBeVisible()
  })

  test('a half-streamed citation marker is not shown as broken syntax', async ({ story }) => {
    const root = await story.open('chat-components-markdown--streaming-partial-marker')
    await expect(root).not.toContainText('[')
  })
})
