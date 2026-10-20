// A Responder backed by a WebSocket server that speaks ./wsProtocol. The
// stories run it against a simulated server (recipes/shared/simulatedNetwork).
//
// Each send() opens a fresh socket, sends {type:'chat', prompt}, and yields
// ChatEvents translated from the wire protocol until the stream finishes.
// Aborting (or the consumer breaking out of the loop) closes the socket,
// which the server treats as a cancel. Failures never throw — they surface
// as {type:'error'} events so the UI renders them in the conversation.

import type { ChatEvent, Responder } from './chatEngine'
import type { WSEvent } from './wsProtocol'

/** Wire event → UI event. Returns the translated events (possibly none). */
function translate(event: WSEvent): ChatEvent[] {
  switch (event.type) {
    case 'thinking':
      return [{ type: 'thinking', delta: event.text }]
    case 'thought':
      return [{ type: 'thinking-done', fullText: event.text }]
    case 'token':
      return [{ type: 'content', delta: event.text }]
    case 'summary': {
      // Citations (and their source highlights) ride in on the summary;
      // surface them before closing the turn.
      const events: ChatEvent[] = []
      if (event.sources?.length)
        events.push({ type: 'sources', sources: event.sources, highlights: event.highlights })
      events.push({
        type: 'done',
        fullText: event.text,
        model: event.model,
        tokens: event.tokens,
        // Faults the server tallied rather than streamed. `type` isn't part of
        // the fault shape, and `recoverable` rides alongside it on the client.
        errors: event.errors?.map(({ recoverable: _r, ...fault }) => fault),
      })
      // Follow-ups come after done — they belong to the finished answer.
      if (event.followups?.length) events.push({ type: 'followups', items: event.followups })
      return events
    }
    case 'tool': {
      const { name, toolCallId, status, input, output, error } = event
      return [{ type: 'tool', toolCall: { name, toolCallId, status, input, output, error } }]
    }
    case 'error': {
      // Everything but the envelope and `recoverable` is the fault itself, so
      // `code`/`source`/`count`/`detail` all survive to the UI.
      const { type: _t, streamId: _s, timestamp: _ts, recoverable, ...fault } = event
      return [{ type: 'error', fault, recoverable }]
    }
    default:
      return []
  }
}

/**
 * The part of a WebSocket the responder uses. The browser's own satisfies it;
 * so does anything that speaks the wire protocol without a network — a test
 * double, or the simulated server the stories run on.
 */
export type ChatSocket = Pick<
  WebSocket,
  'readyState' | 'send' | 'close' | 'onopen' | 'onmessage' | 'onerror' | 'onclose'
>

/**
 * @param connect Opens the socket. Defaults to the browser's `WebSocket`;
 *   pass your own to add auth to the handshake, or to stand in for the server.
 */
export function createWsResponder(
  url: string,
  connect: (url: string) => ChatSocket = (to) => new WebSocket(to),
): Responder {
  return async function* respond(prompt, signal) {
    const socket = connect(url)

    // Push queue bridging socket callbacks to the pull-based generator.
    const queue: ChatEvent[] = []
    let finished = false
    let wake = () => {}
    const push = (...events: ChatEvent[]) => {
      queue.push(...events)
      wake()
    }
    const finish = () => {
      finished = true
      wake()
    }

    socket.onmessage = (msg: MessageEvent) => {
      let event: WSEvent
      try {
        event = JSON.parse(msg.data as string) as WSEvent
      } catch {
        return
      }
      push(...translate(event))
      // summary and fatal error both end the response.
      if (event.type === 'summary' || (event.type === 'error' && !event.recoverable)) finish()
    }
    socket.onerror = () => {
      if (socket.readyState !== WebSocket.OPEN) {
        push({
          type: 'error',
          fault: {
            message: `Chat server not reachable at ${url}.`,
            code: 'SOCKET_UNREACHABLE',
            source: 'transport',
          },
          recoverable: false,
        })
      }
      finish()
    }
    // Server closing without a terminal event still ends the stream cleanly.
    socket.onclose = finish
    socket.onopen = () => socket.send(JSON.stringify({ type: 'chat', prompt }))

    const onAbort = () => finish()
    signal.addEventListener('abort', onAbort, { once: true })

    try {
      while (true) {
        while (queue.length) {
          const next = queue.shift()
          if (next) yield next
        }
        if (finished || signal.aborted) return
        await new Promise<void>((resolve) => {
          wake = resolve
        })
        wake = () => {}
      }
    } finally {
      // Runs on abort, on generator.return() from a consumer break, and on
      // normal completion — the socket never outlives the response.
      signal.removeEventListener('abort', onAbort)
      socket.onclose = null
      socket.close()
    }
  }
}
