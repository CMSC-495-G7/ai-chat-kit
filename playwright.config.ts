import { defineConfig, devices } from '@playwright/test'

// The tests drive the built Storybook: every story is a page, and a
// component's stories are the fixtures its test opens. Build first
// (`npm run build-storybook`); the server below only serves the result.
const PORT = Number(process.env.STORYBOOK_PORT ?? 6007)

export default defineConfig({
  // A component's test sits beside it (`button/button.e2e.ts`), the same way
  // its stories do. `tests/` holds what covers the library as a whole.
  // Named `.e2e.ts` so Vitest, which owns `*.test.tsx`, never claims one.
  testDir: '.',
  testMatch: ['src/**/*.e2e.ts', 'tests/**/*.e2e.ts'],
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1280, height: 800 },
    // Animations collapse under reduced motion (brand/tokens.css), so a test
    // never has to wait one out.
    reducedMotion: 'reduce',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `node scripts/serve-storybook.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
})
