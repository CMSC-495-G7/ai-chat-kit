import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Unit tests: a component or a function on its own, in jsdom, with no Storybook
// and no browser. They sit beside the module as `<name>.test.tsx`.
//
// The browser tests are Playwright's and are named `<name>.e2e.ts`
// (playwright.config.ts). Vitest's default pattern would also claim `*.spec.*`
// and anything under `tests/`, so the pattern here is spelled out: the two
// runners must never pick up each other's files.
export default defineConfig({
  // Only the React plugin. Tailwind is left out on purpose: jsdom lays nothing
  // out, so a unit test asserts roles, names and calls, never how it looks.
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit-setup.ts'],
    // Stylesheets a module imports resolve to nothing rather than being parsed.
    css: false,
    restoreMocks: true,
  },
})
