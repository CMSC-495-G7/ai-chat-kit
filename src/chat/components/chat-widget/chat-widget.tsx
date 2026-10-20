import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { BrandingProvider, type Branding } from '../../engine/branding'
import { CitationsProvider } from '../../engine/citations'
import { XIcon } from '../../../primitives/icons'
import { UiSizeProvider } from '../../../lib/uiSize'
import { CUSTOM_THEME_CLASS, createPalette, type PaletteInput } from '../../../lib/palette'
import type { Responder } from '../../engine/chatEngine'
import { useChat } from '../../engine/useChat'
import type {
  AskedOverChip,
  AskedOverScope,
  Highlight,
  Message,
  Suggestion,
  ComposerFeatures,
  SidePanel,
  Source,
} from '../../engine/types'
import { useHostTheme, type ThemeMode } from './useHostTheme'
import { WidgetPanel, type WidgetProfile } from './widget-panel'

export type WidgetPosition = 'bottom-right' | 'bottom-left'

/**
 * Whether the reader has seen this message's final content.
 *
 * `streaming` must be compared to `false`, not tested for truthiness: useChat
 * appends the assistant message with `streaming` UNDEFINED and only sets it
 * true once content starts, so a falsy check would call a turn finished before
 * it had produced a word. Every terminal path there — done, fault, abort,
 * responder throw — sets it explicitly to false.
 *
 * A user message in the transcript is always settled: one that hasn't run yet
 * is in the queue, which the transcript never holds.
 */
function isSettled(m: Message): boolean {
  return m.role === 'user' || m.streaming === false
}

/** Imperative surface the mount handle drives (open/close/setTheme/setPalette). */
export type WidgetController = {
  current: {
    open(): void
    close(): void
    setTheme(theme: ThemeMode): void
    setPalette(palette: PaletteInput | null): void
  } | null
}

/** Host-supplied content that makes the (otherwise brand-agnostic) widget concrete. */
export type WidgetContent = {
  responder: Responder
  branding: Branding
  /** Today's suggested questions for the tenant — the composer's sparkle
   *  menu. Omit for no menu and no suggest-as-you-type. */
  suggestions?: Suggestion[]
  /** More questions suggest-as-you-type may match, after today's list. */
  typeaheadPool?: Suggestion[]
  /**
   * Which composer features this viewer has. A hook, like `useScope`, so a
   * settings change reaches the open widget. Omitted, everything is on.
   */
  useFeatures?: () => ComposerFeatures
  starters: string[]
  sidePanels: SidePanel[]
  /**
   * Label the launcher reveals on hover while the conversation is still empty.
   * Defaults to `Chat with <appName>`.
   */
  launcherLabel?: string
  /** Hook read inside the widget tree so host-profile changes stay live. */
  useProfile: () => WidgetProfile
  /**
   * The same, for whatever narrows the assistant's answers.
   *
   * A hook rather than values because the chips have to stay live while the
   * widget is open, and the widget is mounted imperatively — there is no host
   * render to push new props in on. Omit it and questions record nothing.
   */
  useScope?: () => WidgetScope
}

export type WidgetScope = {
  /** Called at dispatch to record what a turn is being asked over. */
  capture?: () => AskedOverScope | undefined
  /** In force now, for the "changed since" badge. */
  chips?: AskedOverChip[]
  onRestore?: (scope: AskedOverScope) => void
}

const ALL_FEATURES: ComposerFeatures = {}
/** Default so the hook call below is unconditional, as a hook must be. */
function useAllFeatures(): ComposerFeatures {
  return ALL_FEATURES
}

const NO_SCOPE: WidgetScope = {}
/** Default so the hook call below is unconditional, as a hook must be. */
function useNoScope(): WidgetScope {
  return NO_SCOPE
}

type ChatWidgetProps = WidgetContent & {
  initialTheme: ThemeMode
  /** `chat-theme-*` class from brand.css, applied to the widget's own root. */
  themeClass?: string
  /** A custom palette (see `createPalette`), applied on top of `themeClass`. */
  initialPalette?: PaletteInput
  position: WidgetPosition
  zIndex: number
  controller: WidgetController
}

/**
 * The floating launcher orb plus the pop-in chat panel. Chat state lives
 * here — the panel is hidden with CSS rather than unmounted, so the
 * conversation and draft survive closing and reopening.
 */
export function ChatWidget({
  responder,
  branding,
  suggestions,
  typeaheadPool,
  useFeatures = useAllFeatures,
  starters,
  sidePanels,
  launcherLabel,
  useProfile,
  useScope = useNoScope,
  initialTheme,
  themeClass,
  initialPalette,
  position,
  zIndex,
  controller,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [citation, setCitation] = useState<{
    sources: Source[]
    activeId: number
    highlights?: Highlight[]
  } | null>(null)
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme)
  const dark = useHostTheme(themeMode)
  const [palette, setPalette] = useState<PaletteInput | null>(initialPalette ?? null)
  // Inline on the root, beside the theme class: inside a shadow root nothing
  // from the host page can reach the widget, so this is how a custom palette
  // gets in.
  const paletteVars = useMemo(() => (palette ? createPalette(palette) : null), [palette])
  const profile = useProfile()
  const scope = useScope()
  const features = useFeatures()

  const {
    messages,
    busy,
    queue,
    held,
    send,
    stop,
    sendNow,
    sendQueuedNow,
    editQueued,
    moveQueued,
    removeQueued,
    hold,
    resume,
    clearQueue,
    chain,
    retry,
    reset,
  } = useChat(responder, { captureScope: scope.capture })

  useEffect(() => {
    controller.current = {
      open: () => setOpen(true),
      close: () => setOpen(false),
      setTheme: setThemeMode,
      setPalette,
    }
    return () => {
      controller.current = null
    }
  }, [controller])

  const right = position === 'bottom-right'

  // The launcher's label is an EMPTY-THREAD affordance, not once-per-visitor
  // onboarding: `fresh` resets on reload by design, so someone returning to a
  // blank widget is told what it is again.
  const label = launcherLabel ?? `Chat with ${branding.appName}`
  const canExpand = messages.length === 0 && !open

  // High-water mark of what has actually been READ. It tracks the last
  // *complete* message, not the last message: an assistant turn is appended
  // empty the moment it starts, so watermarking the bare id would mark a reply
  // seen while it was still streaming — minimise mid-stream and the finished
  // answer would never count as unread. Written on commit so the render below
  // can read it without mutating a ref mid-render.
  const lastSeenRef = useRef(0)
  useEffect(() => {
    if (!open) return
    for (let i = messages.length - 1; i >= 0; i--) {
      if (isSettled(messages[i])) {
        lastSeenRef.current = messages[i].id
        return
      }
    }
  }, [open, messages])

  // Answers that landed while the panel was closed. Derived from the thread
  // rather than accumulated in state, so a reset or a re-open can't strand a
  // stale count — and a half-streamed turn doesn't count until it finishes.
  const unread = open
    ? 0
    : messages.filter(
        (m) => m.role === 'assistant' && m.streaming === false && m.id > lastSeenRef.current,
      ).length

  // Minimize keeps the conversation for later; close ends it.
  const minimize = () => setOpen(false)
  const close = () => {
    setOpen(false)
    setExpanded(false)
    setCitation(null)
    reset()
  }
  const newChat = () => {
    setCitation(null)
    reset()
  }

  // Opening a citation needs the wide layout to fit the split view; the
  // mobile full-screen override makes the expand a no-op there.
  const openCitation = (sources: Source[], id: number, highlights?: Highlight[]) => {
    setCitation({ sources, activeId: id, highlights })
    setExpanded(true)
  }
  // Shrinking back to the narrow panel leaves no room for the frame.
  const toggleExpand = () => {
    if (expanded) setCitation(null)
    setExpanded(!expanded)
  }

  // The theme class and `dark` go on the same element: brand.css derives its
  // light/dark tokens on whichever element carries the theme, and `:root`
  // never matches inside the widget's shadow root.
  return (
    <BrandingProvider value={branding}>
      <div
        // Portal target for overlays (the citation hover card). It has to be
        // this element: inside the shadow root, so the widget's stylesheet
        // applies, but outside the dialog below — whose `translate`/`scale`
        // make it a containing block for `position: fixed`, which would rebase
        // every coordinate an overlay computes, and whose `overflow-hidden`
        // would then clip the result to the rounded panel.
        data-chat-overlay-root
        className={`${dark ? 'dark' : ''} ${themeClass ?? ''} ${
          paletteVars ? CUSTOM_THEME_CLASS : ''
        } font-(family-name:--font-brand) text-ink antialiased`}
        style={
          {
            ...paletteVars,
            colorScheme: dark ? 'dark' : 'light',
            // The overlay layer is a sibling of the dialog, so it needs the
            // host's own stacking floor to paint above it. A custom property
            // because the layer is created imperatively, outside React's props.
            '--chat-overlay-z': String(zIndex + 1),
          } as CSSProperties
        }
      >
        <UiSizeProvider value="compact">
          <div
            role="dialog"
            aria-label={`${branding.appName} chat`}
            inert={!open}
            style={{ zIndex }}
            className={`fixed bottom-24 flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-surface border border-line bg-panel-solid shadow-2xl shadow-(color:--shadow-deep) transition-all duration-300 ease-out max-sm:top-0 max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:h-auto max-sm:max-h-none max-sm:w-auto max-sm:rounded-none ${
              // 440 rather than the old 380: the side rail takes a fixed 40px,
              // so the panel column lands on exactly 400 and its content on
              // 368. That is what stops facet labels truncating — "Operating
              // — Alderfinch" fits, where at 380 it did not — and it lets the
              // two load buttons sit side by side. Height is unchanged; the
              // Filters panel is constrained by vertical room, not width.
              expanded ? 'h-[94dvh] w-[max(560px,calc(100vw-2.5rem))]' : 'h-[660px] w-[440px]'
            } ${right ? 'right-5 origin-bottom-right' : 'left-5 origin-bottom-left'} ${
              open
                ? 'translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none translate-y-2 scale-95 opacity-0'
            }`}
          >
            <CitationsProvider value={openCitation}>
              <WidgetPanel
                scopeChips={scope.chips}
                onRestoreScope={scope.onRestore}
                messages={messages}
                busy={busy}
                expanded={expanded}
                citation={citation}
                suggestions={suggestions}
                typeaheadPool={typeaheadPool}
                starters={starters}
                profile={profile}
                sidePanels={sidePanels}
                onSelectCitation={(id) => setCitation((c) => c && { ...c, activeId: id })}
                onCloseCitation={() => setCitation(null)}
                queue={queue}
                held={held}
                onSubmit={send}
                onStop={stop}
                onSendNow={sendNow}
                onSendQueuedNow={sendQueuedNow}
                onEditQueued={editQueued}
                onMoveQueued={moveQueued}
                onRemoveQueued={removeQueued}
                onHold={hold}
                onResume={resume}
                onClearQueue={clearQueue}
                chain={chain}
                features={features}
                onRetry={retry}
                onReset={newChat}
                onToggleExpand={toggleExpand}
                onMinimize={minimize}
                onClose={close}
              />
            </CitationsProvider>
          </div>

          {/* Launcher. The sphere is pinned to the anchored edge and the label
              opens away from it, so the hover target never moves out from under
              the cursor — a label that pushed the sphere would drop the hover
              that opened it, collapse, and chatter. */}
          <div
            style={{ zIndex }}
            className={`fixed bottom-5 ${right ? 'right-5' : 'left-5'} ${
              open ? 'max-sm:hidden' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={
                open
                  ? 'Close chat'
                  : unread > 0
                    ? `${label} — ${unread} new ${unread === 1 ? 'reply' : 'replies'}`
                    : label
              }
              title={open ? 'Close chat' : label}
              className={`group flex h-[50px] items-center rounded-full transition-[background-color,box-shadow] duration-200 ${
                right ? 'flex-row' : 'flex-row-reverse'
              } ${
                canExpand
                  ? 'launcher-expandable bg-panel-solid shadow-xl shadow-(color:--shadow-deep)'
                  : ''
              }`}
            >
              <span className="launcher-label">
                <span>
                  <span
                    className={`block text-sm font-semibold whitespace-nowrap text-ink-strong ${
                      right ? 'pr-2 pl-5' : 'pr-5 pl-2'
                    }`}
                  >
                    {label}
                  </span>
                </span>
              </span>

              {/* Closed, the sphere carries no glyph — it is the mark, and
                  anything drawn on it competes with its own highlight (a white
                  chat icon measured 2.93:1 against the gradient beneath it).
                  Open swaps it for a plain disc so the X has a ground of its
                  own: a blue glyph on the orb itself lands ~1.9:1. That also
                  reads correctly — the sphere has moved into the panel, and
                  what is left is just a close. */}
              <span
                aria-hidden
                className={`relative grid size-[50px] shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105 group-active:scale-95 ${
                  open ? 'border border-line bg-panel-solid text-brand-fg' : 'orb'
                }`}
              >
                <span
                  className={`transition-all duration-300 ${
                    open ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-90 opacity-0'
                  }`}
                >
                  <XIcon width={22} height={22} />
                </span>
              </span>
            </button>

            {/* A plain presence marker, not a count: the real number is still
                announced through the button's own label, but the badge itself
                only ever says "something's waiting", so it doesn't need to
                update glyph-by-glyph as replies land while the panel is closed.

                Separation from the orb is a shadow rather than a ring. It used
                to be a 2px --panel-solid border, which worked by standing the
                dot on a disc of panel colour — and that was doing more than it
                looked: the dot overlaps the orb's top-right, exactly where its
                warm bloom sits, and --notify against that bloom is 1.49:1.
                Bare, the edge would dissolve into the sphere. A shadow
                separates by darkening what is behind the rim instead, which
                holds over a gradient the way a single flat border colour
                cannot. */}
            {unread > 0 && (
              <span
                aria-hidden
                className={`pointer-events-none absolute -top-0.5 size-3 rounded-full bg-notify shadow-md shadow-(color:--shadow-deep) ${
                  right ? '-right-0.5' : '-left-0.5'
                }`}
              />
            )}
          </div>
        </UiSizeProvider>
      </div>
    </BrandingProvider>
  )
}
