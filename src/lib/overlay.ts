// Where a portalled overlay (today: the citation hover card) is allowed to land.
//
// `createPortal(node, document.body)` is the usual answer and it is wrong here,
// because this library runs in two very different hosts:
//
//   - The full chat app, where `<main class="glass">` carries a `backdrop-filter`.
//     That makes it a containing block for `position: fixed` descendants, which
//     in turn lets its own `overflow-hidden` clip them. An overlay has to be
//     rendered outside it. `document.body` is outside it.
//
//   - The embedded widget, which lives in a shadow root whose `<style>` holds
//     the *only* copy of this library's CSS (see chat/components/chat-widget/mount.tsx). A portal to
//     `document.body` lands outside that tree and renders unstyled.
//
// So the parent is resolved from the anchor rather than assumed, and the layer
// restates its own theme rather than relying on inheriting one (see
// hooks/useOverlayLayer.ts) — brand.css keys every token off a class, so a
// layer that names its theme derives correctly wherever it sits.

import { createContext, useContext } from 'react'

/**
 * Marks the element an overlay layer should be appended to. Put it on an
 * element that is inside the same tree as the stylesheet *and* has no
 * transform / filter / backdrop-filter of its own — any of those would capture
 * `position: fixed` and quietly rebase every coordinate the layer computes.
 */
export const OVERLAY_ROOT_ATTR = 'data-chat-overlay-root'

/** The layer itself. One per parent, shared by every overlay under it. */
export const OVERLAY_LAYER_ATTR = 'data-chat-overlay-layer'
/** A separate, higher layer for short-lived tooltips. */
export const TOOLTIP_LAYER_ATTR = 'data-chat-tooltip-layer'

/**
 * A container to portal into, for an app that already owns one. Either the
 * element, or a function of the anchor for an app with several trees (a modal,
 * a shadow-rooted embed) that has to pick between them.
 */
export type OverlayContainer = HTMLElement | ((anchor: HTMLElement) => HTMLElement | null) | null

const OverlayContainerContext = createContext<OverlayContainer>(null)

/**
 * Supplies a ready-made portal container to every overlay in the tree. This is
 * the one seam an app with its own hover-container portal has to use — the
 * default resolution below applies when it is unset.
 *
 * A context rather than a prop for the same reason CitationsProvider is one:
 * the consumer is CitationChip, four levels under anything that could know
 * about a container (ChatMessage → Markdown → ReactMarkdown → the `a` override
 * → the chip).
 */
export const OverlayContainerProvider = OverlayContainerContext.Provider

export function useOverlayContainer(): OverlayContainer {
  return useContext(OverlayContainerContext)
}

/**
 * The node an overlay anchored to `anchor` should be appended to. Ordered, and
 * each step earns its place:
 *
 *  1. a native dialog is in the browser's top layer, above every ordinary
 *     container — even an injected one cannot safely pull its overlay out;
 *  2. an injected container wins otherwise — an app knows its own layout;
 *  3. `closest()` deliberately does not cross shadow boundaries, which is
 *     exactly right: a chip inside the widget finds the widget's marked root
 *     and never the host page's;
 *  4. an unmarked shadow root still must keep its CSS, so the layer goes into
 *     the shadow root itself;
 *  5. otherwise the document — the plain-app case.
 */
export function resolveOverlayParent(
  anchor: HTMLElement,
  injected?: OverlayContainer,
): HTMLElement | ShadowRoot {
  const dialog = anchor.closest<HTMLDialogElement>('dialog[open]')
  if (dialog) return dialog

  const custom = typeof injected === 'function' ? injected(anchor) : injected
  if (custom) return custom

  const marked = anchor.closest<HTMLElement>(`[${OVERLAY_ROOT_ATTR}]`)
  if (marked) return marked

  const root = anchor.getRootNode()
  if (root instanceof ShadowRoot) return root

  return document.body
}

/**
 * The theme identity in force at `anchor`, as classes to restate on a layer.
 *
 * Tokens in brand.css are keyed off classes, not position: `.dark`,
 * `chat-theme-*` and `chat-highlight-*` re-derive their tokens on whatever
 * element carries them. So a layer that names its own theme resolves correctly
 * even when it is appended somewhere that inherits nothing from the themed
 * subtree — which is the normal case, since the whole point of the layer is to
 * sit outside the app shell.
 *
 * Nearest wins per prefix, and the two are collected independently: an app may
 * well put its palette on `<html>` and a highlight swatch on one panel.
 *
 * The walk crosses shadow boundaries via `.host` on purpose — the widget's
 * 'auto' theme mirrors the host page's `<html class="dark">`.
 */
const MIRRORED_PREFIXES = ['chat-theme-', 'chat-highlight-']

export function overlayThemeClasses(anchor: Element): string {
  const found = new Map<string, string>()
  let dark = false
  let node: Node | null = anchor

  while (node) {
    if (node instanceof Element) {
      if (node.classList.contains('dark')) dark = true
      for (const prefix of MIRRORED_PREFIXES) {
        if (found.has(prefix)) continue
        const cls = [...node.classList].find((c) => c.startsWith(prefix))
        if (cls) found.set(prefix, cls)
        // The attribute spelling of the same thing (`data-chat-theme="x"`),
        // normalised to the class the stylesheet also matches.
        const attr = node.getAttribute(`data-${prefix.replace(/-$/, '')}`)
        if (!found.has(prefix) && attr) found.set(prefix, prefix + attr)
      }
    }
    node = node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode
  }

  // The font and base ink are inherited inside the app but not on a layer that
  // landed on document.body, so the layer states them itself — the same trio
  // the widget's own theme root carries.
  return [
    'font-(family-name:--font-brand)',
    'text-ink',
    'antialiased',
    dark ? 'dark' : '',
    ...found.values(),
  ]
    .filter(Boolean)
    .join(' ')
}
