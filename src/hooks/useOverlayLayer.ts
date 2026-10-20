// The DOM node a portalled overlay renders into, created on demand next to the
// anchor's surface. See ../overlay.ts for why the parent has to be resolved
// rather than assumed.

import { useEffect, useState } from 'react'
import {
  OVERLAY_LAYER_ATTR,
  TOOLTIP_LAYER_ATTR,
  overlayThemeClasses,
  resolveOverlayParent,
  useOverlayContainer,
} from '../lib/overlay'

export type OverlayLayerKind = 'default' | 'tooltip'

/** The layer for `anchor`, or null until the anchor is mounted. */
export function useOverlayLayer(
  anchor: HTMLElement | null,
  kind: OverlayLayerKind = 'default',
): HTMLElement | null {
  const injected = useOverlayContainer()
  const [layer, setLayer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!anchor) return
    const parent = resolveOverlayParent(anchor, injected)
    const attribute = kind === 'tooltip' ? TOOLTIP_LAYER_ATTR : OVERLAY_LAYER_ATTR

    // One layer per parent, shared by every overlay under it. Reused rather
    // than created per-card: two adjacent chips handing a hover to one another
    // would otherwise build and tear down two layers in the same frame.
    let el = parent.querySelector<HTMLElement>(`:scope > [${attribute}]`)
    if (!el) {
      el = document.createElement('div')
      el.setAttribute(attribute, '')
      // `fixed inset-0` rather than a node sized to the card: it gives the
      // positioning code one stable, measurable frame of reference, and costs
      // nothing because the layer is transparent to hit-testing — the card
      // switches pointer events back on for itself.
      el.style.cssText = 'position:fixed;inset:0;pointer-events:none;'
      // Handed down as a custom property so the widget can supply its own
      // stacking floor without this hook importing widget code. The fallback
      // clears the demo's mobile slide-over (z-40).
      el.style.setProperty(
        'z-index',
        kind === 'tooltip' ? 'var(--chat-tooltip-z, 1000)' : 'var(--chat-overlay-z, 50)',
      )
      parent.appendChild(el)
    }

    const classes = overlayThemeClasses(anchor)
    el.className = classes
    el.style.colorScheme = classes.split(' ').includes('dark') ? 'dark' : 'light'
    setLayer(el)

    // Deliberately not removed on cleanup: it is an empty, hit-test-transparent
    // div, and tearing it down every time a chip unmounts churns the DOM
    // throughout a stream. The widget's shadow root takes its own with it.
  }, [anchor, injected, kind])

  return layer
}
