import { expect, test } from '../../../tests/story'

test.describe('SectionLabel', () => {
  test('it is drawn in small capitals without changing the text itself', async ({ story }) => {
    const root = await story.open('primitives-sectionlabel--playground')
    const label = root.getByText('Details', { exact: true })
    await expect(label).toHaveCSS('text-transform', 'uppercase')
    await expect(label).toHaveCSS('font-size', '11px')
  })

  test('the caution tone has its own colour', async ({ story }) => {
    const colour = async (id: string, text: string) => {
      const root = await story.open(`primitives-sectionlabel--${id}`)
      return root.getByText(text, { exact: true }).evaluate((node) => getComputedStyle(node).color)
    }
    expect(await colour('playground', 'Details')).not.toBe(
      await colour('caution', 'Policy exception'),
    )
  })

  test('in a panel each label sits above the block it names', async ({ story }) => {
    const root = await story.open('primitives-sectionlabel--in-a-panel')
    const label = (await root.getByText('Details', { exact: true }).boundingBox())!
    const block = (await root.getByText('Assigned to Dana Whitfield').boundingBox())!
    expect(label.y + label.height).toBeLessThanOrEqual(block.y)
  })
})
