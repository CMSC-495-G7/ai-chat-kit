import { describe, expect, it } from 'vitest'
import type { ChatEvent } from './chatEngine'
import type { WSEvent } from './wsProtocol'
import { createWsResponder, type ChatSocket } from './wsResponder'

type Wire = WSEvent extends infer E
  ? E extends WSEvent
    ? Omit<E, 'streamId' | 'timestamp'>
    : never
  : never

/** A socket the test drives by hand: it opens, speaks and closes when told to. */
function fakeSocket() {
  const sent: string[] = []
  let readyState: ChatSocket['readyState'] = 0
  let closedByClient = false
  const socket: ChatSocket = {
    get readyState() {
      return readyState
    },
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    send: (data) => void sent.push(String(data)),
    close: () => {
      closedByClient = true
      readyState = 3
    },
  }
  const fire = (handler: 'onopen' | 'onmessage' | 'onerror' | 'onclose', event: Event) =>
    (socket[handler] as ((event: Event) => void) | null)?.(event)
  return {
    socket,
    sent,
    get closedByClient() {
      return closedByClient
    },
    open() {
      readyState = 1
      fire('onopen', new Event('open'))
    },
    say(event: Wire) {
      const data = JSON.stringify({ streamId: 's1', timestamp: 0, ...event })
      fire('onmessage', new MessageEvent('message', { data }))
    },
    sayRaw(data: string) {
      fire('onmessage', new MessageEvent('message', { data }))
    },
    refuse() {
      readyState = 3
      fire('onerror', new Event('error'))
      fire('onclose', new Event('close'))
    },
    hangUp() {
      readyState = 3
      fire('onclose', new Event('close'))
    },
  }
}

/** Starts a turn and collects what the responder yields until it finishes. */
function start(prompt = 'hello') {
  const server = fakeSocket()
  const urls: string[] = []
  const responder = createWsResponder('wss://example.test/chat', (url) => {
    urls.push(url)
    return server.socket
  })
  const controller = new AbortController()
  const events: ChatEvent[] = []
  const finished = (async () => {
    for await (const event of responder(prompt, controller.signal)) events.push(event)
    return events
  })()
  return { server, urls, controller, events, finished }
}

describe('createWsResponder', () => {
  it('connects to its URL and sends the prompt once the socket opens', async () => {
    const { server, urls, finished } = start('What is our liquidity floor?')
    expect(urls).toEqual(['wss://example.test/chat'])
    expect(server.sent).toEqual([])

    server.open()
    expect(server.sent.map((frame) => JSON.parse(frame))).toEqual([
      { type: 'chat', prompt: 'What is our liquidity floor?' },
    ])
    server.hangUp()
    await finished
  })

  it('turns the reasoning and answer streams into deltas, in order', async () => {
    const { server, finished } = start()
    server.open()
    server.say({ type: 'thinking', text: 'Let me ', index: 0 })
    server.say({ type: 'thinking', text: 'check.', index: 1 })
    server.say({ type: 'thought', text: 'Let me check.' })
    server.say({ type: 'token', text: 'Forty-five ', index: 0 })
    server.say({ type: 'token', text: 'days.', index: 1 })
    server.say({ type: 'summary', text: 'Forty-five days.', model: 'm-1', tokens: 9 })

    expect(await finished).toEqual([
      { type: 'thinking', delta: 'Let me ' },
      { type: 'thinking', delta: 'check.' },
      { type: 'thinking-done', fullText: 'Let me check.' },
      { type: 'content', delta: 'Forty-five ' },
      { type: 'content', delta: 'days.' },
      { type: 'done', fullText: 'Forty-five days.', model: 'm-1', tokens: 9 },
    ])
  })

  it('unpacks the summary: sources first, then done, then follow-ups', async () => {
    const { server, finished } = start()
    server.open()
    const sources = [{ id: 1, title: 'Liquidity policy', markdown: '# Policy' }]
    const highlights = [{ referenceNumber: 1, sections: [{ idx: 0, start: 2, end: 8 }] }]
    server.say({
      type: 'summary',
      text: 'See [1].',
      sources,
      highlights,
      followups: ['And last quarter?'],
      errors: [{ message: 'Not reranked', code: 'RERANK_SKIPPED', count: 2, recoverable: true }],
    })

    const events = await finished
    expect(events.map((event) => event.type)).toEqual(['sources', 'done', 'followups'])
    expect(events[0]).toEqual({ type: 'sources', sources, highlights })
    // `recoverable` belongs to the wire; the fault the UI keeps does not carry it.
    expect(events[1]).toMatchObject({
      errors: [{ message: 'Not reranked', code: 'RERANK_SKIPPED', count: 2 }],
    })
    expect(events[2]).toEqual({ type: 'followups', items: ['And last quarter?'] })
  })

  it('passes a tool call through at each stage', async () => {
    const { server, finished } = start()
    server.open()
    server.say({
      type: 'tool',
      name: 'live_quote',
      toolCallId: 't1',
      status: 'started',
      input: { symbol: 'AGG' },
    })
    server.say({
      type: 'tool',
      name: 'live_quote',
      toolCallId: 't1',
      status: 'failed',
      error: 'Timed out',
    })
    server.say({ type: 'summary', text: 'ok' })

    const [started, failed] = await finished
    expect(started).toEqual({
      type: 'tool',
      toolCall: {
        name: 'live_quote',
        toolCallId: 't1',
        status: 'started',
        input: { symbol: 'AGG' },
      },
    })
    expect(failed).toMatchObject({ toolCall: { status: 'failed', error: 'Timed out' } })
  })

  it('reports a recoverable error and keeps listening', async () => {
    const { server, finished } = start()
    server.open()
    server.say({
      type: 'error',
      message: 'Search fell back',
      code: 'SEARCH_FALLBACK',
      source: 'retrieval',
      detail: { index: 'secondary' },
      recoverable: true,
    })
    server.say({ type: 'token', text: 'Still here.', index: 0 })
    server.say({ type: 'summary', text: 'Still here.' })

    const events = await finished
    expect(events[0]).toEqual({
      type: 'error',
      recoverable: true,
      fault: {
        message: 'Search fell back',
        code: 'SEARCH_FALLBACK',
        source: 'retrieval',
        detail: { index: 'secondary' },
      },
    })
    expect(events.at(-1)?.type).toBe('done')
  })

  it('ends the turn on a fatal error, and hangs up', async () => {
    const { server, finished } = start()
    server.open()
    server.say({ type: 'token', text: 'Partly', index: 0 })
    server.say({ type: 'error', message: 'Model stopped', recoverable: false })

    const events = await finished
    expect(events.at(-1)).toEqual({
      type: 'error',
      recoverable: false,
      fault: { message: 'Model stopped' },
    })
    // A server that keeps talking is talking to nobody.
    server.say({ type: 'token', text: ' ignored', index: 1 })
    expect(events).toHaveLength(2)
    expect(server.closedByClient).toBe(true)
  })

  it('reports a refused connection as a fault instead of throwing', async () => {
    const { server, finished } = start()
    server.refuse()

    const events = await finished
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'error',
      recoverable: false,
      fault: { code: 'SOCKET_UNREACHABLE', source: 'transport' },
    })
    expect(server.sent).toEqual([])
  })

  it('ends the stream when the server closes without a closing event', async () => {
    const { server, finished } = start()
    server.open()
    server.say({ type: 'token', text: 'Half an ans', index: 0 })
    server.hangUp()

    expect(await finished).toEqual([{ type: 'content', delta: 'Half an ans' }])
  })

  it('skips a frame that is not JSON', async () => {
    const { server, finished } = start()
    server.open()
    server.sayRaw('<html>502 Bad Gateway</html>')
    server.say({ type: 'summary', text: 'ok' })
    expect((await finished).map((event) => event.type)).toEqual(['done'])
  })

  it('closes the socket when the turn is aborted', async () => {
    const { server, controller, finished } = start()
    server.open()
    server.say({ type: 'token', text: 'One', index: 0 })
    controller.abort()

    await finished
    expect(server.closedByClient).toBe(true)
  })

  it('closes the socket when the consumer stops reading', async () => {
    const server = fakeSocket()
    const responder = createWsResponder('wss://example.test/chat', () => server.socket)
    const stream = responder('hello', new AbortController().signal)
    const first = stream.next()
    server.open()
    server.say({ type: 'token', text: 'One', index: 0 })
    await first
    await stream.return(undefined)
    expect(server.closedByClient).toBe(true)
  })
})
