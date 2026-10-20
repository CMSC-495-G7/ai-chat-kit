// Compare two folders of story screenshots (see story-screenshots.mjs).
//
//   node scripts/compare-screenshots.mjs <baseline dir> <current dir> [report.json]
//
// Files are matched by name. A pair counts as changed when more than
// TOLERATED pixels differ by more than THRESHOLD on any channel; the pixel
// comparison runs in a browser canvas so the script needs no image library.
//
// The tolerance is not zero because two runs of the same build are not always
// pixel-identical: the anti-aliased corners of a rounded box can land a few
// values apart depending on how busy the machine was. A real change moves
// hundreds of pixels, so a handful is safely ignored.
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const [baselineDir, currentDir, reportFile] = process.argv.slice(2)
if (!baselineDir || !currentDir) {
  console.error('usage: node scripts/compare-screenshots.mjs <baseline> <current> [report.json]')
  process.exit(1)
}

const THRESHOLD = 8
const TOLERATED = Number(process.env.TOLERATED ?? 16)

const require = createRequire(process.env.PW_FROM ?? path.join(process.cwd(), 'package.json'))
const { chromium } = require('playwright')

const names = (dir) => {
  const manifest = path.join(dir, 'manifest.json')
  if (fs.existsSync(manifest)) {
    return new Set(
      Object.keys(JSON.parse(fs.readFileSync(manifest, 'utf8'))).map((id) => `${id}.png`),
    )
  }
  return new Set(fs.readdirSync(dir).filter((file) => file.endsWith('.png')))
}
const baseline = names(baselineDir)
const current = names(currentDir)

const report = { same: [], changed: [], resized: [], missing: [], added: [] }
for (const name of current) if (!baseline.has(name)) report.added.push(name)

const browser = await chromium.launch()
const page = await browser.newPage()

for (const name of [...baseline].sort()) {
  if (!current.has(name)) {
    report.missing.push(name)
    continue
  }
  const a = fs.readFileSync(path.join(baselineDir, name))
  const b = fs.readFileSync(path.join(currentDir, name))
  if (a.equals(b)) {
    report.same.push(name)
    continue
  }
  const result = await page.evaluate(
    async ([first, second, threshold]) => {
      const load = async (base64) => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        return image
      }
      const [one, two] = await Promise.all([load(first), load(second)])
      if (one.width !== two.width || one.height !== two.height) {
        return { resized: [one.width, one.height, two.width, two.height] }
      }
      const canvas = new OffscreenCanvas(one.width, one.height)
      const context = canvas.getContext('2d', { willReadFrequently: true })
      const pixels = (image) => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, canvas.width, canvas.height).data
      }
      const left = pixels(one)
      const right = pixels(two)
      let differing = 0
      let largest = 0
      for (let i = 0; i < left.length; i += 4) {
        const delta = Math.max(
          Math.abs(left[i] - right[i]),
          Math.abs(left[i + 1] - right[i + 1]),
          Math.abs(left[i + 2] - right[i + 2]),
          Math.abs(left[i + 3] - right[i + 3]),
        )
        if (delta > threshold) differing++
        if (delta > largest) largest = delta
      }
      return { differing, largest, total: left.length / 4 }
    },
    [a.toString('base64'), b.toString('base64'), THRESHOLD],
  )
  if (result.resized) report.resized.push({ name, size: result.resized })
  else if (result.differing > TOLERATED) report.changed.push({ name, ...result })
  else report.same.push(name)
}
await browser.close()

if (reportFile) fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
console.log(
  `${report.same.length} same, ${report.changed.length} changed, ${report.resized.length} resized, ` +
    `${report.missing.length} missing, ${report.added.length} added`,
)
for (const item of report.changed) {
  console.log(`  changed  ${item.name}  ${item.differing} px (largest delta ${item.largest})`)
}
for (const item of report.resized) {
  console.log(
    `  resized  ${item.name}  ${item.size[0]}x${item.size[1]} -> ${item.size[2]}x${item.size[3]}`,
  )
}
for (const name of report.missing) console.log(`  missing  ${name}`)
process.exit(report.changed.length + report.resized.length > 0 ? 1 : 0)
