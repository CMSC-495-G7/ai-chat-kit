// Screenshot every story of a built Storybook.
//
//   node scripts/story-screenshots.mjs <storybook-static dir> <output dir> [id filter regex]
//
// One PNG per story id plus manifest.json (id → title, name). The clock is
// fixed and motion is reduced so two runs of the same story are comparable.
import { createRequire } from 'node:module'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const [staticDir, outDir, filter] = process.argv.slice(2)
if (!staticDir || !outDir) {
  console.error('usage: node scripts/story-screenshots.mjs <storybook-static> <out> [filter]')
  process.exit(1)
}

const require = createRequire(process.env.PW_FROM ?? path.join(process.cwd(), 'package.json'))
const { chromium } = require('playwright')

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  let file = path.join(staticDir, decodeURIComponent(url.pathname))
  if (file.endsWith('/')) file += 'index.html'
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end()
      return
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    res.end(data)
  })
})
await new Promise((resolve) => server.listen(0, resolve))
const base = `http://localhost:${server.address().port}`

const index = JSON.parse(fs.readFileSync(path.join(staticDir, 'index.json'), 'utf8'))
const pattern = filter ? new RegExp(filter) : null
const stories = Object.values(index.entries)
  .filter((entry) => entry.type === 'story')
  .filter((entry) => !pattern || pattern.test(entry.id))

fs.mkdirSync(outDir, { recursive: true })
const manifestFile = path.join(outDir, 'manifest.json')
const manifest =
  filter && fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {}
const failures = []

const browser = await chromium.launch()
const WORKERS = Number(process.env.SCREENSHOT_WORKERS ?? 6)
let next = 0

async function worker() {
  while (next < stories.length) {
    const story = stories[next++]
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce',
      colorScheme: 'light',
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date('2026-10-04T10:00:00'))

    try {
      await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' })
      await page.waitForSelector('#storybook-root > *', { timeout: 15000 })
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(outDir, `${story.id}.png`), fullPage: true })
      manifest[story.id] = { title: story.title, name: story.name }
    } catch (error) {
      failures.push({ id: story.id, error: String(error).split('\n')[0] })
    } finally {
      await context.close()
    }
  }
}

await Promise.all(Array.from({ length: WORKERS }, worker))
await browser.close()
server.close()

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`${Object.keys(manifest).length} stories captured, ${failures.length} failed`)
for (const failure of failures) console.log('  FAILED', failure.id, failure.error)

if (failures.some((failure) => !failure.id.endsWith('recentchatspanel--empty')))
  process.exitCode = 1
