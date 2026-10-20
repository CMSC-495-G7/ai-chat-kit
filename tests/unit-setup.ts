// Runs before every unit test file (vitest.config.ts).
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Testing Library unmounts between tests on its own only when the runner's
// globals are on. They are off here — every test imports what it uses — so
// the cleanup is registered by hand.
afterEach(cleanup)

// What jsdom leaves out and components reach for. Inert stand-ins: enough for
// a component to mount, not a simulation. A test that depends on a media query
// or a resize replaces these with `vi.stubGlobal` for its own case.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: () => false,
    }) as MediaQueryList
}

class InertObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.ResizeObserver ??= InertObserver as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= InertObserver as unknown as typeof IntersectionObserver
Element.prototype.scrollIntoView ??= () => {}
