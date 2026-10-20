// Open/close for a hover card, to WCAG 2.2 SC 1.4.13 (Content on Hover or
// Focus): hoverable, dismissible, persistent.
//
// The three rules, and what each one costs here:
//
//   hoverable   the pointer must be able to travel onto the card and stay
//               there. A portalled card can't share a CSS bridge with its
//               anchor (different trees), so the close is delayed and the card
//               reports its own enter/leave.
//   dismissible Escape closes it, and does so without also closing whatever is
//               behind it.
//   persistent  no auto-dismiss timer. It stays while hover or focus does.

import { useCallback, useEffect, useRef, useState } from 'react'

/** Long enough that sweeping a cursor across a paragraph of markers doesn't
 *  strobe a card per marker; short enough to still feel like an answer. */
const OPEN_MS = 180
/** Covers the diagonal the pointer takes from chip to card. */
const CLOSE_MS = 140

/** Only one card at a time: focus on one chip plus hover on another would
 *  otherwise stack two. Module-scoped because the competing cards are siblings
 *  with no shared React state. */
let openCard: symbol | null = null
const listeners = new Set<() => void>()

function claim(id: symbol) {
  openCard = id
  for (const notify of listeners) notify()
}

export type HoverCardState = {
  open: boolean
  /** Spread onto the trigger element. */
  anchorProps: {
    onPointerEnter: (e: React.PointerEvent) => void
    onPointerLeave: () => void
    onPointerDown: () => void
    onFocus: (e: React.FocusEvent) => void
    onBlur: () => void
  }
  /** Spread onto the card's outermost wrapper. */
  cardProps: {
    onPointerEnter: () => void
    onPointerLeave: () => void
  }
  close: () => void
}

export function useHoverCard(enabled = true): HoverCardState {
  const [open, setOpen] = useState(false)
  const id = useRef(Symbol('hover-card')).current
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // A click opens the reference panel; the card that was already up would
  // otherwise hang over the panel it just opened, and the pointer still resting
  // on the chip would reopen it the moment it closed.
  const suppressed = useRef(false)

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const close = useCallback(() => {
    clear()
    setOpen(false)
    if (openCard === id) openCard = null
  }, [id])

  const openAfter = (ms: number) => {
    clear()
    timer.current = setTimeout(() => {
      claim(id)
      setOpen(true)
    }, ms)
  }

  const closeAfter = () => {
    clear()
    timer.current = setTimeout(close, CLOSE_MS)
  }

  // Yield when another card claims the slot.
  useEffect(() => {
    const check = () => {
      if (openCard !== id) {
        clear()
        setOpen(false)
      }
    }
    listeners.add(check)
    return () => {
      listeners.delete(check)
    }
  }, [id])

  useEffect(() => clear, [])

  // Escape, captured at the document so it runs before React's root listener —
  // otherwise one press would close the card *and* the reference panel behind
  // it (ReferencePanel handles Escape too).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      close()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, close])

  // Evaluated per event rather than once at mount: a hybrid device's pointer
  // changes, and on touch `:hover` sticks after a tap so the card would never
  // close again.
  const finePointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

  return {
    open: enabled && open,
    anchorProps: {
      onPointerEnter: (e) => {
        if (!enabled || e.pointerType === 'touch' || !finePointer()) return
        if (suppressed.current) return
        openAfter(OPEN_MS)
      },
      onPointerLeave: () => {
        suppressed.current = false
        closeAfter()
      },
      onPointerDown: () => {
        suppressed.current = true
        close()
      },
      onFocus: (e) => {
        // No delay on focus — that would just be latency. `:focus-visible`
        // keeps a mouse click, which already opens the reference panel, from
        // raising a card on top of it.
        if (!enabled || !e.currentTarget.matches(':focus-visible')) return
        openAfter(0)
      },
      onBlur: close,
    },
    cardProps: {
      onPointerEnter: clear,
      onPointerLeave: closeAfter,
    },
    close,
  }
}
