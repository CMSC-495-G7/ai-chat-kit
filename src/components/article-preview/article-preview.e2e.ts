import { expect, test } from '../../../tests/story'

const TITLE = 'Same-day wire transfers: cut-off times and approvals'

test.describe('ArticlePreview', () => {
  test('it is a group named for the article, holding one article', async ({ story, page }) => {
    await story.open('components-articlepreview--playground')
    const group = page.getByRole('group', { name: `Article: ${TITLE}` })
    await expect(group.getByRole('article')).toBeVisible()
    await expect(group.getByRole('heading', { level: 2, name: TITLE })).toBeVisible()
  })

  test('short facts share a row; a passage takes the full width', async ({ story, page }) => {
    await story.open('components-articlepreview--playground')
    const box = async (text: string) => (await page.getByText(text, { exact: true }).boundingBox())!
    const [product, audience, question] = [
      await box('Product'),
      await box('Audience'),
      await box('Question'),
    ]
    expect(audience.y).toBe(product.y)
    expect(audience.x).toBeGreaterThan(product.x)
    expect(question.y).toBeGreaterThan(product.y)
    expect(question.x).toBe(product.x)
  })

  test('rich text is drawn as a document: headings, a table, a list, a picture', async ({
    story,
    page,
  }) => {
    await story.open('components-articlepreview--playground')
    const sheet = page.getByRole('article')
    await expect(sheet.getByRole('heading', { name: 'Cut-off times', exact: true })).toBeAttached()
    await expect(sheet.getByRole('table').getByRole('row')).toHaveCount(4)
    await expect(sheet.getByRole('listitem')).toHaveCount(3)
    const picture = sheet.getByRole('img', { name: /initiator to an approver/ })
    await picture.scrollIntoViewIfNeeded()
    // Loaded, not a broken-image box.
    await expect
      .poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
  })

  test('the sheet is white with dark ink in dark mode too', async ({ story, page }) => {
    await story.open('components-articlepreview--playground', { mode: 'dark' })
    const sheet = page.getByRole('article')
    await expect(sheet).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(sheet.getByRole('heading', { level: 2 })).toHaveCSS('color', 'rgb(31, 41, 51)')
  })

  test('zoomed, the sheet scales and reflows, so nothing scrolls sideways', async ({
    story,
    page,
  }) => {
    await story.open('components-articlepreview--zoomed')
    await expect(page.getByRole('article')).toHaveCSS('zoom', '1.5')
    const group = page.getByRole('group')
    expect(await group.evaluate((box) => box.scrollWidth - box.clientWidth)).toBe(0)
  })

  test('an unset field is left out, or shown as a dash when asked', async ({ story, page }) => {
    await story.open('components-articlepreview--playground')
    await expect(page.getByText('Internal notes')).toHaveCount(0)
    await story.open('components-articlepreview--with-empty-fields')
    await expect(page.getByText('Internal notes')).toBeAttached()
  })

  test('fields that don’t say what they are are still drawn as what they hold', async ({
    story,
    page,
  }) => {
    await story.open('components-articlepreview--untyped-fields')
    const sheet = page.getByRole('article')
    await expect(sheet.getByRole('table')).toBeAttached()
    await expect(
      sheet.getByRole('link', { name: 'https://library.example.com/policies/wires' }),
    ).toBeAttached()
    await expect(sheet).not.toContainText('<p>')
  })

  test('a Salesforce response is drawn without its file field or repeated title', async ({
    story,
    page,
  }) => {
    await story.open('components-articlepreview--from-salesforce')
    const sheet = page.getByRole('article')
    await expect(sheet.getByText('Out of Date')).toBeVisible()
    await expect(sheet.getByText('My File')).toHaveCount(0)
    await expect(sheet.getByText('Title', { exact: true })).toHaveCount(0)
    // Its answer arrived as a type the mapping has no name for.
    await expect(sheet.getByRole('listitem')).toHaveCount(2)
  })

  test('hostile rich text runs nothing and covers nothing', async ({ story, page }) => {
    await story.open('components-articlepreview--sanitised')
    const sheet = page.getByRole('article')
    await expect(sheet.getByText('This paragraph is fine.')).toBeVisible()
    const ran = await page.evaluate(() =>
      ['__articleScriptRan', '__articleHandlerRan', '__articleLinkRan'].filter(
        (flag) => flag in window,
      ),
    )
    expect(ran).toEqual([])
    await expect(sheet.locator('script, style, iframe, form, input, button')).toHaveCount(0)
    await expect(sheet.getByText('An overlay that tried to cover the page.')).toHaveCSS(
      'position',
      'static',
    )
    // The safe link is still a link, and leaves the app when followed.
    await expect(sheet.getByRole('link', { name: 'a link that is safe' })).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  test('the sample file in public/docs is fetched and drawn', async ({ story, page }) => {
    // The file is a placeholder meant to be replaced, so this asks only that
    // an article with a title is drawn — not which.
    await story.open('components-articlepreview--sample-article-file')
    await expect(page.getByRole('article').getByRole('heading', { level: 2 })).toBeVisible()
  })

  test('an article with no fields is its title alone', async ({ story, page }) => {
    await story.open('components-articlepreview--title-only')
    const sheet = page.getByRole('article')
    await expect(
      sheet.getByRole('heading', { level: 2, name: 'Holiday processing schedule' }),
    ).toBeVisible()
    await expect(sheet.locator('dl, section')).toHaveCount(0)
  })
})
