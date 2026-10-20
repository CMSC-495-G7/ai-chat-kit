import { useMemo, useRef, useState } from 'react'
import { ResizableColumn } from '../../../../components/resizable-column'
import { SideTabPanel, SideTabRail, type SideTab } from '../../../../components/side-tabs'
import { useStickToBottom } from '../../../../hooks/useStickToBottom'
import { IconButton } from '../../../../primitives/icon-button'
import {
  CollapseDiagonalIcon,
  ExpandDiagonalIcon,
  MinusIcon,
  RefreshIcon,
  XIcon,
} from '../../../../primitives/icons'
import { Orb } from '../../../../primitives/orb'
import { ScrollToBottomButton } from '../../../../primitives/scroll-to-bottom-button'
import { useBranding } from '../../../engine/branding'
import type {
  AskedOverChip,
  AskedOverScope,
  ChainControls,
  ComposerFeatures,
  Highlight,
  Message,
  QueueMove,
  QueuedMessage,
  SidePanel,
  Source,
  Suggestion,
} from '../../../engine/types'
import { ChatMessage } from '../../chat-message'
import { Composer } from '../../composer'
import { QueueDock, QueueDraft, type QueueDockHandle } from '../../queue-dock'
import { ReferencePanel } from '../../reference-panel'

/** Host-provided profile shown in the header and greeting. */
export type WidgetProfile = { name: string; loginId?: string }

type WidgetPanelProps = {
  messages: Message[]
  busy: boolean
  expanded: boolean
  citation: { sources: Source[]; activeId: number; highlights?: Highlight[] } | null
  /** Today's suggested questions (the composer's sparkle menu), and more
   *  for suggest-as-you-type to match. */
  suggestions?: Suggestion[]
  typeaheadPool?: Suggestion[]
  /** Suggested prompts shown on the empty greeting screen. */
  starters: string[]
  /** Host-provided user profile (name / login). */
  profile: WidgetProfile
  /** Filters in force now — a question recorded under different ones says so. */
  scopeChips?: AskedOverChip[]
  onRestoreScope?: (scope: AskedOverScope) => void
  /** Host-injected side-rail tabs and their panels. */
  sidePanels: SidePanel[]
  onSelectCitation: (id: number) => void
  onCloseCitation: () => void
  /** Messages written but not yet run — the dock above the composer. */
  queue: QueuedMessage[]
  held: boolean
  onSubmit: (text: string) => void
  onStop: () => void
  onSendNow: (text: string) => void
  onSendQueuedNow: (id: number) => void
  onEditQueued: (id: number, text: string) => void
  onMoveQueued: (id: number, to: QueueMove) => void
  onRemoveQueued: (id: number) => void
  onHold: () => void
  onResume: () => void
  onClearQueue: () => void
  /** The chain being built or run, and its controls. */
  chain: ChainControls
  /** Composer features switched on for this viewer. */
  features?: ComposerFeatures
  onRetry: (id: number) => void
  onReset: () => void
  onToggleExpand: () => void
  onMinimize: () => void
  onClose: () => void
}

/** The inside of the widget: header, message list (or greeting), composer,
 *  and — when a citation is open — the reference frame (side-by-side split
 *  in the expanded layout, slide-over on the mobile full-screen sheet).
 *  Brand-agnostic: suggestions, starters, profile, and side panels are injected. */
export function WidgetPanel({
  messages,
  busy,
  expanded,
  citation,
  suggestions,
  typeaheadPool,
  starters,
  profile,
  sidePanels,
  scopeChips,
  onRestoreScope,
  onSelectCitation,
  onCloseCitation,
  queue,
  held,
  onSubmit,
  onStop,
  onSendNow,
  onSendQueuedNow,
  onEditQueued,
  onMoveQueued,
  onRemoveQueued,
  onHold,
  onResume,
  onClearQueue,
  chain,
  features = {},
  onRetry,
  onReset,
  onToggleExpand,
  onMinimize,
  onClose,
}: WidgetPanelProps) {
  const { appName, disclaimer } = useBranding()
  const dockRef = useRef<QueueDockHandle>(null)
  const { containerRef, contentRef, atBottom, scrollToBottom } = useStickToBottom()
  const inChat = messages.length > 0
  // Only the newest turn offers follow-ups, so branches don't stack up the thread.
  const lastId = messages[messages.length - 1]?.id
  // The discoverability tip belongs on the first answer that actually has
  // something to click — not every cited message, or it'd pile up.
  const firstCitedId = messages.find((m) => m.sources && m.sources.length > 0)?.id

  // Side rail: openTab drives visibility; lastTab keeps the panel's title and
  // content stable while the close animation plays.
  const hasRail = sidePanels.length > 0
  const [openTab, setOpenTab] = useState<string | null>(null)
  const [lastTab, setLastTab] = useState<string>(sidePanels[0]?.id ?? '')
  const selectTab = (id: string | null) => {
    setOpenTab(id)
    if (id) setLastTab(id)
  }
  const shownTab = openTab ?? lastTab
  const shownPanel = sidePanels.find((p) => p.id === shownTab)

  const sideTabs: SideTab[] = sidePanels.map((p) => ({
    id: p.id,
    label: p.label,
    icon: p.icon,
    badge: p.badge,
  }))

  const { name, loginId } = profile
  const firstName = name.split(' ')[0]

  const queueOn = features.queue !== false
  const suggestOn = features.suggestions !== false
  // Running a chain puts its first question on screen, so bring it into view.
  const chainControls = useMemo<ChainControls>(
    () => ({
      ...chain,
      run: () => {
        chain.run()
        scrollToBottom()
      },
    }),
    [chain, scrollToBottom],
  )

  // A message the reader sends themselves always comes into view, even if
  // they'd scrolled up to reread earlier turns — streamed replies then keep
  // following automatically because this also re-arms `atBottom`.
  const submit = (text: string) => {
    onSubmit(text)
    scrollToBottom()
  }

  return (
    <>
      <header className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <Orb className="orb block size-6 shrink-0 rounded-full" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <span className="text-sm leading-tight font-semibold text-ink-strong">{appName}</span>
          {name && (
            <span className="truncate text-[11px] leading-tight text-ink-soft">
              {name}
              {loginId ? ` · ${loginId}` : ''}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {inChat && (
            <IconButton onClick={onReset} aria-label="New chat" title="New chat">
              <RefreshIcon width={16} height={16} />
            </IconButton>
          )}
          {/* The mobile sheet is already full-screen; expand only matters on desktop. */}
          <IconButton
            onClick={onToggleExpand}
            aria-pressed={expanded}
            className="max-sm:hidden"
            aria-label={expanded ? 'Shrink panel' : 'Expand panel'}
            title={expanded ? 'Shrink' : 'Expand'}
          >
            {expanded ? (
              <CollapseDiagonalIcon width={16} height={16} />
            ) : (
              <ExpandDiagonalIcon width={16} height={16} />
            )}
          </IconButton>
          <IconButton onClick={onMinimize} aria-label="Minimize chat" title="Minimize">
            <MinusIcon width={16} height={16} />
          </IconButton>
          <IconButton
            onClick={onClose}
            aria-label="Close chat and end conversation"
            title="End chat"
          >
            <XIcon width={16} height={16} />
          </IconButton>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {hasRail && <SideTabRail tabs={sideTabs} activeId={openTab} onSelect={selectTab} />}

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <div ref={containerRef} className="h-full overflow-y-auto px-4 py-4">
              <div ref={contentRef}>
                {inChat ? (
                  <div className="flex flex-col gap-5">
                    {messages.map((m) => (
                      <ChatMessage
                        key={m.id}
                        message={m}
                        onRetry={onRetry}
                        onFollowup={m.id === lastId ? submit : undefined}
                        busy={busy}
                        scopeChips={scopeChips}
                        onRestoreScope={onRestoreScope}
                        showSourceTip={m.id === firstCitedId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <Orb className="orb block size-12 rounded-full animate-orb-drift" aria-hidden />
                    <p className="mt-3 text-base font-semibold text-ink-strong">
                      {firstName ? `Hi, ${firstName}` : `Hi, I'm ${appName}`}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {firstName ? `I'm ${appName} — how can I help?` : `Ask ${appName} anything.`}
                    </p>
                    {loginId && <p className="text-xs text-ink-soft/70">Signed in as {loginId}</p>}
                    <div className="mt-4 flex flex-col items-stretch gap-2 self-stretch px-2">
                      {starters.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => submit(prompt)}
                          className="glass rounded-control px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent/50 hover:text-ink-strong"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {inChat && (
              <ScrollToBottomButton
                visible={!atBottom}
                onClick={() => scrollToBottom({ smooth: true })}
              />
            )}
          </div>

          <div className="px-3 pb-2">
            <QueueDraft>
              {(draft, onDraftChange) => (
                <>
                  <QueueDock
                    ref={dockRef}
                    items={queue}
                    held={held}
                    busy={busy}
                    draft={draft}
                    onSendNow={onSendQueuedNow}
                    onEdit={onEditQueued}
                    onMove={onMoveQueued}
                    onRemove={onRemoveQueued}
                    onHold={onHold}
                    onResume={onResume}
                    onClear={onClearQueue}
                    chain={queueOn ? chainControls : undefined}
                  />
                  <Composer
                    docked
                    streaming={busy}
                    onStop={onStop}
                    onSubmit={(text, opts) => {
                      if (opts?.steer) {
                        onSendNow(text)
                        scrollToBottom()
                      } else {
                        submit(text)
                      }
                    }}
                    onArrowUp={() => dockRef.current?.focusLast()}
                    onDraftChange={onDraftChange}
                    suggestions={suggestOn ? suggestions : undefined}
                    typeaheadPool={typeaheadPool}
                    typeaheadStorageKey="composer-typeahead:widget"
                    queueing={queueOn}
                    chain={queueOn ? chainControls : undefined}
                  />
                </>
              )}
            </QueueDraft>
            <p className="mt-1.5 text-center text-[10px] text-ink-soft/70">{disclaimer}</p>
          </div>

          {/* Side-tab panel — slides over the chat column, next to the rail. */}
          {hasRail && (
            <div
              className={`absolute inset-0 z-10 flex flex-col bg-panel-solid transition-[opacity,translate] duration-300 ease-out ${
                openTab
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none -translate-x-2 opacity-0'
              }`}
              inert={!openTab}
            >
              {shownPanel && (
                <SideTabPanel
                  title={shownPanel.title}
                  onClose={() => selectTab(null)}
                  fill={shownPanel.fill}
                >
                  {typeof shownPanel.content === 'function'
                    ? shownPanel.content({ close: () => selectTab(null) })
                    : shownPanel.content}
                </SideTabPanel>
              )}
            </div>
          )}
        </div>

        {/* Reference frame — side-by-side split in the wide expanded layout. */}
        {citation && (
          <ResizableColumn
            initial={360}
            aria-label="Resize reference panel"
            className="hidden flex-col border-l border-line sm:flex"
          >
            <ReferencePanel
              sources={citation.sources}
              activeId={citation.activeId}
              highlights={citation.highlights}
              onSelect={onSelectCitation}
              onClose={onCloseCitation}
            />
          </ResizableColumn>
        )}

        {/* Mobile: the panel is full-screen, so the frame slides over the chat. */}
        <div
          className={`absolute inset-0 z-10 flex flex-col bg-panel-solid transition-transform duration-300 ease-out sm:hidden ${
            citation ? 'translate-x-0' : 'pointer-events-none translate-x-full'
          }`}
          inert={!citation}
        >
          {citation && (
            <ReferencePanel
              sources={citation.sources}
              activeId={citation.activeId}
              highlights={citation.highlights}
              onSelect={onSelectCitation}
              onClose={onCloseCitation}
              backLabel="Back to chat"
            />
          )}
        </div>
      </div>
    </>
  )
}
