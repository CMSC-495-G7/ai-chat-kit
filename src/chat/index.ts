// @radixp0int/ai-chat-kit/chat — the chat area: engine, chat components and the
// embeddable widget. The generic tiers it builds on are the package root,
// imported from there rather than re-exported here.

// Engine and the streaming contract
export * from './engine/chatEngine'
export * from './engine/wsProtocol'
export * from './engine/wsResponder'

// Hooks
export * from './engine/useChat'
export * from './engine/useHighlights'

// The data-driven feature gate (the catalogue and persistence are generic)
export * from './engine/featureGate'

// Context and shared types
export * from './engine/branding'
export * from './engine/citations'
export * from './engine/highlights'
export * from './engine/types'

// Components — one folder per component
export * from './components/asked-over'
export * from './components/chat-menu'
export * from './components/chat-message'
export * from './components/chat-widget'
export * from './components/citation-chip'
export * from './components/composer'
export * from './components/conversation'
export * from './components/followup-chips'
export * from './components/greeting'
export * from './components/markdown'
export * from './components/message-actions'
export * from './components/persona-menu'
export * from './components/persona-panel'
export * from './components/queue-dock'
export * from './components/recent-chats-panel'
export * from './components/reference-panel'
export * from './components/source-strip'
export * from './components/suggestions'
export * from './components/thinking-block'
export * from './components/tool-call-chip'
export * from './components/turn-trace'
