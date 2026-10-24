import { useMemo, useState } from 'react'
import { DocumentPreview, documentKindOf } from '../../../components/document-preview'
import { ResizableColumn } from '../../../components/resizable-column'
import { SlideOver } from '../../../components/slide-over'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { AmbientGlow } from '../../../primitives/ambient-glow'
import { SlidersIcon, UserIcon } from '../../../primitives/icons'
import { ChatMenu, ChatMenuBody } from '../../components/chat-menu'
import { InSideMenu } from '../../../components/side-menu'
import { Conversation } from '../../components/conversation/conversation'
import { Greeting } from '../../components/greeting'
import { ReferencePanel, type ReferenceOriginalProps } from '../../components/reference-panel'
import { BrandingProvider } from '../../engine/branding'
import { createCannedResponder, type Responder } from '../../engine/chatEngine'
import { CitationsProvider } from '../../engine/citations'
import { applyFeatureGate } from '../../engine/featureGate'
import { type Highlight, type Source } from '../../engine/types'
import { useChat } from '../../engine/useChat'
import { ARTICLE_FILE_TYPE, cannedTurns } from '../../fixtures/cannedTurns'
import { APP_NAME, DEMO_USER, DISCLAIMER, demoBranding } from '../../fixtures/config'
import { FACET_TYPES, describeFacetType } from '../../fixtures/facets'
import { recentChats } from '../../fixtures/recentChats'
import { todaysSuggestions, typeaheadPool } from '../../fixtures/suggestions'
import { FeatureTogglesModal } from '../settings-dialogs/feature-toggles-modal'
import { UserSettingsModal } from '../settings-dialogs/user-settings-modal'
import { DemoFeaturesProvider, useDemoFeatureState, useDemoFeatures } from '../shared/demoFeatures'
import { useDemoFacets, useDemoScope } from '../shared/useDemoFacets'
import { ArticleOriginal } from './article-original'
import { TopBar } from './top-bar'

// What the chat streams from unless it is handed something else: the canned
// turns, replayed locally. A story passes `responder` to put the simulated
// network in its place; an app would pass `createWsResponder(url)`.
const cannedResponder = createCannedResponder(cannedTurns)

type CitationState = { sources: Source[]; activeId: number; highlights?: Highlight[] } | null

// Where the demo's one knowledge article is served. An app would build this
// from the source — its own backend's address for that article.
const ARTICLE_URL = '/docs/sample.article.json'

// The reference panel's Original view. A source gets one only when it is a
// knowledge article, or links to a file the preview can draw; anything else
// keeps the excerpt alone. This is the app's to supply — the widget shares the
// panel and leaves it out.
function renderOriginal({ source, ...view }: ReferenceOriginalProps) {
  if (source.fileType === ARTICLE_FILE_TYPE) return <ArticleOriginal url={ARTICLE_URL} {...view} />
  const kind = documentKindOf(source.fileType ?? source.url)
  if (!source.url || !kind) return null
  return <DocumentPreview src={source.url} kind={kind} title={source.title} {...view} />
}

type ChatProps = {
  /** Inside the platform shell: fills its parent rather than the viewport, and
   *  leaves the account menu and its two dialogs to the shell's top bar. */
  embedded?: boolean
  onOpenUserSettings?: () => void
  onOpenFeatureToggles?: () => void
  /** Where answers come from. Must keep its identity between renders. */
  responder?: Responder
}

/** The chat itself. Reads the settings from context, so whoever renders it —
 *  the standalone page below or the platform shell — owns that state. */
export function Chat({
  embedded = false,
  onOpenUserSettings,
  onOpenFeatureToggles,
  responder = cannedResponder,
}: ChatProps) {
  const facets = useDemoFacets()
  const [sidebarOpen, setChatMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const mobileReferences = useMediaQuery('(max-width: 1023px)')
  const [citation, setCitation] = useState<CitationState>(null)
  // The filters rail, as the transcript sees it: how to record the scope a
  // turn runs under, what is set now, and how to put an old scope back. The
  // widget reads the same hook, so both hosts wire it identically.
  const scope = useDemoScope()
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
  const demo = useDemoFeatures()
  // Memoized on identity: with a flag off the mapper rebuilds the array, and a
  // fresh array every render would make every ChatMessage below re-render
  // (none of them are memoized) even when nothing about them changed.
  const shownMessages = useMemo(
    () => applyFeatureGate(messages, demo.flags),
    [messages, demo.flags],
  )

  const facetProps = {
    ...facets,
    onSelectionChange: facets.setSelection,
    onAddCustomFacet: facets.addCustomFacet,
    onRemoveCustomFacet: facets.removeCustomFacet,
    onAddQuery: facets.addQuery,
    onRemoveQuery: facets.removeQuery,
    onClearAll: facets.clearAll,
    facetTypes: FACET_TYPES,
    describeFacetType,
  }

  const startNewChat = () => {
    reset()
    setChatMenuOpen(false)
    setCitation(null)
  }

  return (
    // The highlight swatch rides on the shell rather than on <html>, which is
    // how an app would really scope it — and is worth having here, because a
    // citation's hover card portals to document.body and has to mirror this
    // class back out to keep the same colour.
    <div
      className={`chat-highlight-${demo.highlight} relative flex gap-4 overflow-hidden p-4 ${
        embedded ? 'h-full' : 'h-dvh'
      }`}
    >
      <AmbientGlow />
      {/* In the platform shell the menu is the shell's: this page adds what only
          it knows — the filters and the history — to the chat panel. On its own
          the page frames the same body in a sidebar of its own. */}
      {embedded ? (
        <InSideMenu>
          <ChatMenuBody
            inset
            recentChats={recentChats}
            facets={facetProps}
            onNewChat={startNewChat}
          />
        </InSideMenu>
      ) : (
        <ChatMenu
          appName={APP_NAME}
          recentChats={recentChats}
          facets={facetProps}
          account={{
            user: { ...DEMO_USER, detail: DEMO_USER.email },
            caption: DEMO_USER.plan,
            items: [
              {
                id: 'user',
                label: 'User settings',
                hint: 'Profile and appearance',
                icon: <UserIcon width={16} height={16} />,
                onSelect: () => {
                  onOpenUserSettings?.()
                  setChatMenuOpen(false)
                },
              },
              {
                id: 'features',
                label: 'Feature toggles',
                hint: 'What a response shows',
                icon: <SlidersIcon width={16} height={16} />,
                onSelect: () => {
                  onOpenFeatureToggles?.()
                  setChatMenuOpen(false)
                },
              },
            ],
          }}
          open={sidebarOpen}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onClose={() => setChatMenuOpen(false)}
          onNewChat={startNewChat}
        />
      )}

      <CitationsProvider
        value={(sources, id, highlights) => setCitation({ sources, activeId: id, highlights })}
      >
        <main className="glass relative flex min-w-0 flex-1 overflow-hidden rounded-surface">
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar
              onOpenSidebar={embedded ? undefined : () => setChatMenuOpen(true)}
              showThemeToggle={!embedded}
            />
            <Conversation
              disclaimer={DISCLAIMER}
              greeting={<Greeting name="Joe" />}
              scopeChips={scope.chips}
              onRestoreScope={scope.onRestore}
              messages={shownMessages}
              busy={busy}
              showActions={demo.flags.actions}
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
              onRetry={retry}
              chain={chain}
              features={{ suggestions: demo.flags.suggestions, queue: demo.flags.queue }}
              suggestions={todaysSuggestions}
              typeaheadPool={typeaheadPool}
            />
          </div>

          {/* Desktop: the reference pane shares the card with the chat,
                split by a border — same design as the widget's split view. */}
          {citation && (
            <ResizableColumn
              initial={448}
              storageKey="ref-panel-w"
              minWidth={320}
              minRemainder={360}
              aria-label="Resize reference panel"
              className="hidden animate-fade-up flex-col border-l border-line lg:flex"
            >
              <ReferencePanel
                sources={citation.sources}
                activeId={citation.activeId}
                highlights={citation.highlights}
                onSelect={(id) => setCitation((c) => c && { ...c, activeId: id })}
                onClose={() => setCitation(null)}
                renderOriginal={renderOriginal}
                popOut
              />
            </ResizableColumn>
          )}
        </main>
      </CitationsProvider>

      {citation && (
        <SlideOver
          open={mobileReferences}
          onClose={() => setCitation(null)}
          label="References"
          side="right"
          position="fixed"
          shadow={false}
          scrimClassName="bg-scrim/40 backdrop-blur-sm"
          className="glass w-[min(26rem,100vw)] animate-fade-up flex-col overflow-hidden rounded-l-surface"
        >
          <ReferencePanel
            sources={citation.sources}
            activeId={citation.activeId}
            highlights={citation.highlights}
            onSelect={(id) => setCitation((c) => c && { ...c, activeId: id })}
            onClose={() => setCitation(null)}
            renderOriginal={renderOriginal}
            popOut
          />
        </SlideOver>
      )}
    </div>
  )
}

/** The chat as its own page: owns the settings state and the two dialogs
 *  behind the sidebar's account menu. Both are modal, so at most one is ever
 *  open — opening either closes the other. */
function App({ responder }: Pick<ChatProps, 'responder'>) {
  const demo = useDemoFeatureState()
  const [dialog, setDialog] = useState<'user' | 'features' | null>(null)
  return (
    <BrandingProvider value={demoBranding}>
      <DemoFeaturesProvider value={demo}>
        <Chat
          responder={responder}
          onOpenUserSettings={() => setDialog('user')}
          onOpenFeatureToggles={() => setDialog('features')}
        />
        <UserSettingsModal open={dialog === 'user'} onClose={() => setDialog(null)} />
        <FeatureTogglesModal open={dialog === 'features'} onClose={() => setDialog(null)} />
      </DemoFeaturesProvider>
    </BrandingProvider>
  )
}

export default App
