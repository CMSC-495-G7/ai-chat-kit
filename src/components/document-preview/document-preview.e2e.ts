import { expect, test } from '../../../tests/story'

test.describe('DocumentPreview', () => {
  test('it is a group named for the document it shows', async ({ story, page }) => {
    await story.open('components-documentpreview--docx')
    await expect(
      page.getByRole('group', { name: 'Original document: Sample Word document' }),
    ).toBeVisible()
  })

  test('a Word file is drawn as an article of its text', async ({ story, page }) => {
    await story.open('components-documentpreview--docx')
    await expect(page.getByRole('article')).toContainText('Sample Word document')
  })

  test('while a file loads it says so in a status', async ({ story, page }) => {
    await story.open('components-documentpreview--pdf')
    const group = page.getByRole('group', { name: 'Original document: Sample PDF' })
    // Either still loading, or already drawn: never blank.
    await expect(group.getByRole('status').or(group.locator('canvas').first())).toBeVisible()
  })

  test('a PDF draws its pages once loaded', async ({ story, page }) => {
    await story.open('components-documentpreview--pdf')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 })
  })

  test('scrolling to a later page draws it and keeps the reader there', async ({ story, page }) => {
    await story.open('components-documentpreview--zoomed')
    const group = page.getByRole('group', { name: 'Original document: Sample PDF' })
    await expect(group.locator('canvas').first()).toBeVisible()
    await group.evaluate((box) => box.scrollTo(0, box.scrollHeight))
    await expect(group.locator('[data-page-number="3"] canvas')).toBeVisible()
    // The document stays on screen while the new page loads, so the scroll box
    // never collapses and drops the reader back at the top.
    expect(await group.evaluate((box) => box.scrollTop)).toBeGreaterThan(1000)
  })

  test('a deck is drawn slide by slide, as text', async ({ story, page }) => {
    await story.open('components-documentpreview--pptx')
    const group = page.getByRole('group', { name: 'Original document: Sample presentation' })
    await expect(group.getByText('Sample presentation')).toBeVisible()
    await expect(group.getByText('Slide 2', { exact: true })).toBeVisible()
  })

  test('a slide is fitted to the box and keeps the deck’s shape', async ({ story, page }) => {
    await story.open('components-documentpreview--pptx')
    const group = page.getByRole('group', { name: 'Original document: Sample presentation' })
    await expect(group.getByText('Sample presentation')).toBeVisible()
    const fit = await group.evaluate((box) => {
      const sheet = box.querySelector('.ring-line')!.getBoundingClientRect()
      return { ratio: sheet.width / sheet.height, sideways: box.scrollWidth - box.clientWidth }
    })
    // The fixture is 16:9, and at 100% nothing reaches past the box.
    expect(fit.ratio).toBeCloseTo(16 / 9, 1)
    expect(fit.sideways).toBe(0)
  })

  test('scrolling a deck brings its last slide into view', async ({ story, page }) => {
    await story.open('components-documentpreview--pptx')
    const group = page.getByRole('group', { name: 'Original document: Sample presentation' })
    const last = group.getByText('And a third.')
    // Drawn already, one slide past the view, but below the fold.
    await expect(last).toBeAttached()
    await expect(last).not.toBeInViewport()
    await group.evaluate((box) => box.scrollTo(0, box.scrollHeight))
    await expect(last).toBeInViewport()
  })

  test('each sample file in public/docs opens from its URL', async ({ story, page }) => {
    // The files are placeholders meant to be replaced, so this asks only that
    // each one draws something — a canvas, an article, a sheet — and not what.
    for (const [id, drawn] of [
      ['sample-pdf-file', 'canvas'],
      ['sample-docx-file', 'article'],
      ['sample-pptx-file', '.ring-line > div'],
    ]) {
      await story.open(`components-documentpreview--${id}`)
      await expect(page.getByRole('group').locator(drawn).first()).toBeVisible({ timeout: 20_000 })
      await expect(page.getByRole('alert')).toHaveCount(0)
    }
  })

  test('a URL with nothing behind it offers the file itself', async ({ story, page }) => {
    await story.open('components-documentpreview--missing-file')
    const alert = page.getByRole('alert')
    await expect(alert.getByRole('link', { name: 'Open original' })).toHaveAttribute(
      'href',
      '/docs/missing.pptx',
    )
  })

  test('a file that will not open says so and offers another try', async ({ story, page }) => {
    await story.open('components-documentpreview--cannot-preview')
    const alert = page.getByRole('alert')
    await expect(alert).toContainText('Can’t preview this document here')
    await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})
