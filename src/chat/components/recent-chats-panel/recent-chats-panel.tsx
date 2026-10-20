import type { RecentChatsPanelProps } from './types'

/** Recent conversations to switch between. Selection is UI only for now. */
export function RecentChatsPanel({ chats, activeId, onSelect }: RecentChatsPanelProps) {
  return (
    <div className="flex flex-col gap-1">
      {chats.map((chat) => {
        const active = chat.id === activeId
        return (
          <button
            key={chat.id}
            type="button"
            onClick={() => onSelect(chat.id)}
            aria-current={active || undefined}
            className={`rounded-control border px-3 py-2 text-left transition ${
              active ? 'border-accent bg-tint/6' : 'border-transparent hover:bg-tint/6'
            }`}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[13px] font-semibold text-ink-strong">
                {chat.title}
              </span>
              <span
                className={`shrink-0 text-[10px] ${
                  active ? 'font-medium text-accent-fg' : 'text-ink-soft'
                }`}
              >
                {chat.when}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-ink-soft">{chat.snippet}</span>
          </button>
        )
      })}
    </div>
  )
}
