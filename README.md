# ai-chat-kit

A chat UI kit for React: brand tokens with swappable palettes, primitives, the
components a chat is built from, the chat itself, and an embeddable chat widget.

## Requirements

The package ships its TypeScript and CSS source, not a compiled build. Your
app's own Vite and Tailwind compile it, so you need:

- React 19
- Vite with `@vitejs/plugin-react`
- Tailwind CSS 4 with `@tailwindcss/vite`

## Install

```sh
npm install @radixp0int/ai-chat-kit
```

With pnpm or another strict installer, also add `react-pdf` and `pdfjs-dist` as
direct dependencies, at the `pdfjs-dist` version `react-pdf` pins.

## Use

There are two entry points: the generic tiers, and the chat built on them.

```ts
import { Button, usePalette } from '@radixp0int/ai-chat-kit'
import { Composer, useChat, mountWidget } from '@radixp0int/ai-chat-kit/chat'
```

Import the stylesheets in this order, after Tailwind:

```css
@import 'tailwindcss';
@import '@radixp0int/ai-chat-kit/brand/tokens.css';
@import '@radixp0int/ai-chat-kit/styles.css';
@import '@radixp0int/ai-chat-kit/chat.css';
```

Each sheet carries `@source` lines that point Tailwind at the kit's own files,
so its utility classes are generated even though the package sits outside your
app's root.

### The embeddable widget

The widget renders into a shadow root, so it takes its whole stylesheet as text:

```ts
import cssText from '@radixp0int/ai-chat-kit/widget.css?inline'
```

Pass `cssText` to `mountWidget`.

### PDF previews in the dev server

`DocumentPreview` loads pdf.js's worker by URL. Production builds resolve it on
their own, but Vite's dev server pre-bundles the kit and loses the path. Set the
worker once in your app's entry module:

```ts
import { pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
```

The kit only sets the worker when your app hasn't.

### Fonts and first-paint theme

`@radixp0int/ai-chat-kit/brand/head.html` holds the font links and a small inline script
that applies the stored light/dark mode before first paint. Copy it into your
`index.html` `<head>`, or have your Vite config inject it.

## Developing

```sh
npm install
npm run storybook   # component explorer on :6006
npm test            # unit tests
npm run test:e2e    # Playwright, against a Storybook build
```

Storybook's docs pages cover theming, structure and each component's
configuration.

## License

MIT
