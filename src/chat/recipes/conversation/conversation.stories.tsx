import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollToBottomButton } from '../../../primitives/scroll-to-bottom-button'
import { useStickToBottom } from '../../../hooks/useStickToBottom'
import {
  cannedTurns,
  highlights as fixtureHighlights,
  suggestions,
  typeaheadPool,
} from '../../fixtures/chat'
import { CitationsProvider } from '../../engine/citations'
import { ChatMessage } from '../../components/chat-message'
import { Composer } from '../../components/composer'
import { QueueDock, QueueDraft, type QueueDockHandle } from '../../components/queue-dock'
import { ReferencePanel } from '../../components/reference-panel'
import { SuggestedQuestions } from '../../components/suggestions'
import { createCannedResponder, type Responder } from '../../engine/chatEngine'
import { useChat } from '../../engine/useChat'
import type { Highlight, Source } from '../../engine/types'
import {
  NETWORK,
  networkArgTypes,
  useSimulatedResponder,
  type NetworkCondition,
} from '../shared/simulatedNetwork'

/**
 * The library assembled into a working conversation, with nothing from the
 * full chat app: `useChat` over a canned `Responder`, the transcript, the queue
 * dock, the composer, and a reference panel opened through `CitationsProvider`.
 * Swap `createCannedResponder` for `createWsResponder(url)` — or your own
 * `Responder` — and no component changes: the stories below do exactly that.
 */
function Conversation({ responder, hint }: { responder: Responder; hint: string }) {
  const chat = useChat(responder)
  const dockRef = useRef<QueueDockHandle>(null)
  const { containerRef, contentRef, atBottom, scrollToBottom } = useStickToBottom()
  const [reference, setReference] = useState<{
    sources: Source[]
    id: number
    highlights?: Highlight[]
  } | null>(null)
  const inChat = chat.messages.length > 0
  const lastId = chat.messages.at(-1)?.id
  const submit = (text: string) => {
    chat.send(text)
    scrollToBottom()
  }

  const composer = (docked: boolean, onDraftChange?: (t: string) => void) => (
    <Composer
      docked={docked}
      streaming={chat.busy}
      onStop={chat.stop}
      onSubmit={(text, opts) => (opts?.steer ? chat.sendNow(text) : submit(text))}
      onArrowUp={() => dockRef.current?.focusLast()}
      onDraftChange={onDraftChange}
      suggestions={docked ? suggestions : undefined}
      typeaheadPool={typeaheadPool}
      chain={docked ? chat.chain : undefined}
    />
  )

  return (
    <CitationsProvider
      value={(sources, id, highlights) => setReference({ sources, id, highlights })}
    >
      <div className="flex h-dvh bg-canvas">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <div ref={containerRef} className="h-full overflow-y-auto">
              <div
                ref={contentRef}
                className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-5 py-6"
              >
                {inChat ? (
                  <div className="flex flex-col gap-7">
                    {chat.messages.map((m) => (
                      <ChatMessage
                        key={m.id}
                        message={m}
                        busy={chat.busy}
                        onRetry={chat.retry}
                        onFollowup={m.id === lastId ? submit : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="my-auto flex flex-col gap-4">
                    <h1 className="text-center text-2xl font-extrabold tracking-tight text-ink-strong">
                      Ask about your treasury
                    </h1>
                    <p className="mx-auto max-w-xl text-center text-[13px] text-ink-soft">{hint}</p>
                    <SuggestedQuestions suggestions={suggestions} onPick={submit} />
                    {composer(false)}
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
          {inChat && (
            <div className="mx-auto w-full max-w-3xl px-5 pb-5">
              <QueueDraft>
                {(draft, onDraftChange) => (
                  <>
                    <QueueDock
                      ref={dockRef}
                      items={chat.queue}
                      held={chat.held}
                      busy={chat.busy}
                      draft={draft}
                      onSendNow={chat.sendQueuedNow}
                      onEdit={chat.editQueued}
                      onMove={chat.moveQueued}
                      onRemove={chat.removeQueued}
                      onHold={chat.hold}
                      onResume={chat.resume}
                      onClear={chat.clearQueue}
                      chain={chat.chain}
                    />
                    {composer(true, onDraftChange)}
                  </>
                )}
              </QueueDraft>
            </div>
          )}
        </div>
        {reference && (
          <aside className="flex w-[26rem] shrink-0 flex-col border-l border-line bg-panel-solid max-lg:hidden">
            <ReferencePanel
              sources={reference.sources}
              activeId={reference.id}
              highlights={reference.highlights ?? fixtureHighlights}
              onSelect={(id) => setReference((r) => (r ? { ...r, id } : r))}
              onClose={() => setReference(null)}
            />
          </aside>
        )}
      </div>
    </CitationsProvider>
  )
}

/** The conversation over the canned responder: no wire, no socket. */
function Canned() {
  // A responder must be stable across renders, or useChat rebuilds its stream.
  const responder = useMemo(() => createCannedResponder(cannedTurns), [])
  return (
    <Conversation
      responder={responder}
      hint="Try “draw the approval flow” for a diagram, or “fail” for a recovered fault."
    />
  )
}

/**
 * The same conversation over `createWsResponder`, connected to a simulated
 * server (`../shared/simulatedNetwork.ts`). Nothing leaves the page, and the
 * client code that runs is the code an app runs against a real server.
 */
function OverTheWire({ network }: { network: NetworkCondition }) {
  const responder = useSimulatedResponder(network)
  return <Conversation responder={responder} hint={NETWORK[network].hint} />
}

const meta = {
  title: 'Chat/Recipes/Conversation',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Live. Ask anything; while an answer streams, type again to queue or
 * ⌘/Ctrl+Enter to steer. Click a citation to open the reference panel.
 */
export const Live: Story = { render: () => <Canned /> }

type NetworkStory = StoryObj<Meta<typeof OverTheWire>>

const overTheWire = {
  render: (args) => <OverTheWire {...args} />,
  argTypes: networkArgTypes,
} satisfies NetworkStory

/**
 * A healthy server, over the wire protocol. The prompt picks what it does:
 * “market” runs three tool calls, “quote” has one fail and the model work
 * around it, “degraded” reports problems alongside a good answer, and “error”
 * has the server give up mid-answer.
 */
export const HealthyServer: NetworkStory = { ...overTheWire, args: { network: 'healthy' } }

/**
 * A slow handshake and a slow stream. The waiting state lasts long enough to
 * look at, and to queue, steer or stop while it does.
 */
export const SlowConnection: NetworkStory = { ...overTheWire, args: { network: 'slow' } }

/** No server at all: the turn fails with the transport's own message, and Retry fails again. */
export const ServerUnreachable: NetworkStory = { ...overTheWire, args: { network: 'offline' } }

/** The first attempt is refused and the second connects, so Retry is seen to work. */
export const RetrySucceeds: NetworkStory = { ...overTheWire, args: { network: 'flaky' } }

/**
 * The server goes away partway through an answer without sending an error.
 * The client treats a close as the end of the stream, so the cut-off answer
 * stays on screen as though it were whole.
 */
export const ConnectionDrops: NetworkStory = { ...overTheWire, args: { network: 'drops' } }
