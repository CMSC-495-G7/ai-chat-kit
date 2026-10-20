import { readFileSync } from 'node:fs'
import type { StorybookConfig } from '@storybook/react-vite'

// Fonts and the colour-scheme meta come from the same snippet an app's
// index.html gets, so a story renders in the brand face. Its pre-paint script
// is dropped: here the toolbar, not localStorage, decides the theme (see
// preview.tsx), and the two would race.
function brandHead(): string {
  return readFileSync(new URL('../brand/head.html', import.meta.url), 'utf8')
    .replace(/<script[\s\S]*?<\/script>\s*/g, '')
    .replace(/<!--[\s\S]*?-->\s*/g, '')
}

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    // Handbook pages, then the brand shown from its own tokens.
    '../docs/**/*.mdx',
    '../brand/**/*.stories.@(ts|tsx)',
    // Stories live beside the module they describe — `button/button.stories.tsx`
    // next to `button/button.tsx`. MDX in here is a module's attached contract
    // page (see components/paging/paging.mdx).
    '../src/**/*.@(mdx|stories.@(ts|tsx))',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  // Served from the root, so `public/docs/sample.pdf` is `/docs/sample.pdf` —
  // the placeholder documents the preview stories and the canned chat open.
  staticDirs: ['../public'],
  // Props tables are read from each module's types.ts. react-docgen-typescript
  // follows those imports and the `Omit<…HTMLAttributes…> & {…}` intersections
  // the primitives are written in; the filter keeps the tables to the props a
  // module declares itself, not the few hundred it inherits from the DOM.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName),
      include: ['src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
    },
  },
  previewHead: (head) => `${head}\n${brandHead()}`,
  core: { disableTelemetry: true },
}

export default config
