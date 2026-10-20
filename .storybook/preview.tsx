import type { Decorator, Preview } from '@storybook/react-vite'
// Deep paths, not the package barrels. The preview loads before every story,
// and a barrel import here would pull every module — mermaid included — into
// it, defeating the per-story chunks.
import { SHIPPED_HIGHLIGHTS } from '../src/lib/settings/appearance'
import { UiSizeProvider, type UiSize } from '../src/lib/uiSize'
import { BrandingProvider, type Branding } from '../src/chat/engine/branding'
import { ThemeScope } from './theme-scope'
import './storybook.css'

// The toolbar. Every axis the brand varies on, and nothing else: mode, palette,
// highlight colour and density. They are globals rather than per-story args so
// one flip re-skins every story and every docs page at once.
const PALETTES = [
  { value: 'default', title: 'Navy (default)' },
  { value: 'classic', title: 'Classic' },
  { value: 'deep', title: 'Deep' },
  { value: 'graphite', title: 'Graphite' },
  { value: 'teal', title: 'Teal (custom)' },
  { value: 'plum', title: 'Plum (custom)' },
  { value: 'crimson', title: 'Crimson (custom)' },
]

const branding: Branding = {
  appName: 'Assistant',
  modelName: 'Assistant',
  disclaimer: 'AI can make mistakes. Verify important details.',
}

const withTheme: Decorator = (Story, { globals }) => (
  <ThemeScope mode={globals.mode} palette={globals.palette} highlight={globals.highlight}>
    <UiSizeProvider value={globals.density as UiSize}>
      <BrandingProvider value={branding}>
        <Story />
      </BrandingProvider>
    </UiSizeProvider>
  </ThemeScope>
)

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    mode: {
      description: 'Colour mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    palette: {
      description: 'Brand palette — a chat-theme-* class from brand.css',
      toolbar: { title: 'Palette', icon: 'paintbrush', items: PALETTES, dynamicTitle: true },
    },
    highlight: {
      description: 'Cited-passage <mark> colour — a chat-highlight-* class',
      toolbar: {
        title: 'Highlight',
        icon: 'markup',
        items: SHIPPED_HIGHLIGHTS.map((h) => ({ value: h.id, title: h.label })),
        dynamicTitle: true,
      },
    },
    density: {
      description: 'UiSizeProvider — the widget runs compact',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'compact', title: 'Compact (widget)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    mode: 'light',
    palette: 'default',
    highlight: 'orange',
    density: 'default',
  },
  parameters: {
    layout: 'padded',
    // The palette owns the canvas colour; Storybook's own swatches would fight it.
    backgrounds: { disabled: true },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: 'todo' },
    options: {
      // The sidebar mirrors the folders: brand, then the three generic tiers,
      // then each product area with its own components and recipes.
      storySort: {
        order: [
          'Docs',
          ['Introduction', 'Structure', 'Contracts', 'Configuration', 'Theming'],
          'Brand',
          ['Overview', 'Colour', 'Typography', 'Shape and motion'],
          'Primitives',
          'Components',
          'Chat',
          ['Components', 'Recipes'],
        ],
      },
    },
  },
}

export default preview
