import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ChatWidget,
  type WidgetContent,
  type WidgetController,
  type WidgetPosition,
} from './chat-widget'
import type { PaletteInput } from '../../../lib/palette'
import type { ThemeMode } from './useHostTheme'

export type MountOptions = {
  /**
   * The whole stylesheet for the widget's shadow root, as text. A host that
   * renders no markup of its own inside the widget passes the library's:
   * `import cssText from 'ai-chat-kit/widget.css?inline'`. One that does —
   * side panels, say — compiles its own sheet that also covers that markup
   * (see widget.css). The host supplies it because only the host knows what
   * ends up inside the shadow root, and nothing outside it can style it.
   */
  cssText: string
  /** Element the widget host node is appended to. Defaults to document.body. */
  target?: HTMLElement
  /** 'auto' (default) follows the host page's `dark` class / OS preference. */
  theme?: ThemeMode
  /**
   * Brand palette, as a `chat-theme-*` class from brand/brand.css (e.g.
   * 'chat-theme-deep'). Applied to the widget's own root inside the shadow
   * tree, so the host page's own theme class can't reach it and this is the
   * way to re-skin the widget besides `palette` below. Omit for the default.
   */
  themeClass?: string
  /**
   * A custom palette, built from seed colours at mount (see `createPalette`):
   * `{ brand: '#0f766e' }` is enough. Applied on top of `themeClass`, so the
   * two combine — a shipped class for the highlight swatch, say, and your own
   * colours for the rest. Change it later with `setPalette` on the handle.
   */
  palette?: PaletteInput
  position?: WidgetPosition
  zIndex?: number
}

export type WidgetHandle = {
  open(): void
  close(): void
  setTheme(theme: ThemeMode): void
  /** Swap the custom palette while the widget is open; `null` goes back to
   *  `themeClass` (or the default). */
  setPalette(palette: PaletteInput | null): void
  destroy(): void
}

const FONT_LINKS_ID = 'chat-widget-fonts'
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap'

// @font-face rules don't register from inside a shadow root, so the widget's
// font stylesheet goes into the host document's head. The family is only ever
// *used* inside the widget's shadow tree.
function injectFonts() {
  if (document.getElementById(FONT_LINKS_ID)) return
  for (const attrs of [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
    { rel: 'stylesheet', href: FONT_HREF, id: FONT_LINKS_ID },
  ]) {
    const link = document.createElement('link')
    Object.assign(link, attrs)
    document.head.appendChild(link)
  }
}

/**
 * Mount the chat widget into a shadow root so host-page CSS can't restyle it
 * and the widget's (Tailwind) CSS can't leak out. `content` supplies the
 * host-specific pieces (responder, branding, suggestions, starters, side panels,
 * profile); `options` covers placement and theme. Returns a control handle.
 */
export function mountWidget(content: WidgetContent, options: MountOptions): WidgetHandle {
  const {
    cssText,
    target = document.body,
    theme = 'auto',
    themeClass,
    palette,
    position = 'bottom-right',
    zIndex = 2147483000,
  } = options

  injectFonts()

  const host = document.createElement('div')
  host.setAttribute('data-chat-widget', '')
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = cssText
  shadow.appendChild(style)
  const mountEl = document.createElement('div')
  shadow.appendChild(mountEl)
  target.appendChild(host)

  const controller: WidgetController = { current: null }
  const root = createRoot(mountEl)
  root.render(
    <StrictMode>
      <ChatWidget
        {...content}
        initialTheme={theme}
        themeClass={themeClass}
        initialPalette={palette}
        position={position}
        zIndex={zIndex}
        controller={controller}
      />
    </StrictMode>,
  )

  return {
    open: () => controller.current?.open(),
    close: () => controller.current?.close(),
    setTheme: (t) => controller.current?.setTheme(t),
    setPalette: (p) => controller.current?.setPalette(p),
    destroy: () => {
      // Defer so we never unmount synchronously inside a host React render/commit
      // (e.g. a route change unmounting the page whose effect cleanup calls this).
      queueMicrotask(() => {
        root.unmount()
        host.remove()
      })
    },
  }
}
