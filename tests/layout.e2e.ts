import { expect, test } from '@playwright/test'
import { findCutOff, findTruncated } from './layout'

// A checker that never reports anything is worse than none: it says "fine" about
// a screen that is not. These pages have a known fault each, and a clean one,
// so the checker is shown to find what it claims to before anything leans on it.

const page = (body: string) => `<!doctype html><meta charset="utf-8"><style>
  body { margin: 0; font: 14px sans-serif }
  .box { width: 100px; border: 1px solid #000; }
</style><div id="root">${body}</div>`

test.describe('findCutOff', () => {
  test('finds a child that reaches past a container that hides it', async ({ page: p }) => {
    await p.setContent(
      page(
        `<div class="box" style="overflow:hidden"><div style="width:180px;height:20px;background:#ccc">wide</div></div>`,
      ),
    )
    const found = await findCutOff(p, '#root')
    expect(found).toHaveLength(1)
    expect(found[0]).toContain('hidden by a container')
    expect(found[0]).toContain('right')
  })

  test('finds text that is chopped with no ellipsis', async ({ page: p }) => {
    await p.setContent(
      page(
        `<div class="box" style="overflow:hidden;white-space:nowrap">a sentence far too long for its box</div>`,
      ),
    )
    const found = await findCutOff(p, '#root')
    expect(found.some((line) => line.startsWith('text chopped silently'))).toBe(true)
  })

  test('finds an element that sticks out past the edge of the page', async ({ page: p }) => {
    await p.setViewportSize({ width: 300, height: 200 })
    await p.setContent(
      page(`<div style="width:500px;height:20px;background:#ccc">too wide for the page</div>`),
    )
    const found = await findCutOff(p, '#root')
    expect(found.some((line) => line.startsWith('off the screen'))).toBe(true)
    expect(found.some((line) => line.startsWith('the page scrolls sideways'))).toBe(true)
  })

  test('leaves alone what is cut off on purpose or can be scrolled to', async ({ page: p }) => {
    await p.setContent(
      page(`
        <div class="box" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">an ellipsis says it was shortened</div>
        <div class="box" style="overflow-x:auto"><div style="width:400px;height:20px;background:#ccc">scrolls</div></div>
        <div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"><span style="display:block;width:300px">screen reader only</span></div>
        <div class="box">fits</div>`),
    )
    expect(await findCutOff(p, '#root')).toEqual([])
  })

  test('says which text an ellipsis is hiding, so a test can judge it', async ({ page: p }) => {
    await p.setContent(
      page(`<table style="table-layout:fixed;width:104px"><tr><th class="box" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">a column header that is too long</th></tr>
            <tr><td class="box" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">a cell that is too long for it</td></tr></table>`),
    )
    const found = await findTruncated(p, '#root')
    expect(found.map((line) => line.split(':')[0]).sort()).toEqual(['cell', 'header'])
  })
})
