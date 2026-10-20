import type { RecentChat } from '../../engine/types'

export type RecentChatsPanelProps = {
  chats: RecentChat[]
  activeId: string
  onSelect: (id: string) => void
}
