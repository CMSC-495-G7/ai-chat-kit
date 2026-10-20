import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Picked up by Storybook's Vite builder. The library is source-only, so these
// two plugins are what turn its TSX and Tailwind classes into something a
// browser runs — the same two a consuming app compiles it with.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundled up front. Otherwise Vite discovers each of these the first
    // time a story that imports it is opened, re-optimises, and reloads the
    // whole preview mid-browse. Pre-bundling is server-side only: each story
    // still fetches these lazily, and only when it imports them.
    include: [
      'beautiful-mermaid',
      'dompurify',
      'react-markdown',
      'remark-gfm',
      'rehype-raw',
      'react-datepicker',
    ],
  },
})
