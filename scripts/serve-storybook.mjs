// Serve the built Storybook for the Playwright tests.
//
//   node scripts/serve-storybook.mjs [port]
//
// A static file server and nothing else. Build first: npm run build-storybook.
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('storybook-static')
const port = Number(process.argv[2] ?? process.env.STORYBOOK_PORT ?? 6007)

if (!existsSync(path.join(root, 'index.json'))) {
  console.error('storybook-static/ is missing. Run `npm run build-storybook` first.')
  process.exit(1)
}

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

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname)
  const file = path.resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`)
  if (file !== root && !file.startsWith(root + path.sep)) return response.writeHead(403).end()
  try {
    const data = await readFile(file)
    response.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    })
    response.end(data)
  } catch {
    response.writeHead(404).end()
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Storybook served at http://127.0.0.1:${port}`)
})
