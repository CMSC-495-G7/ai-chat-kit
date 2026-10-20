import { useRef, useState } from 'react'
import { Card } from './card'

const cards = [
  { id: 'recent', title: 'Recently visited', body: 'Role: Technology Analyst' },
  { id: 'reports', title: 'Saved reports', body: 'Quarterly tenant activity' },
  { id: 'tasks', title: 'Team tasks', body: 'Review access requests' },
]

/** Story-only parent adapter: no list state or sorting policy lives in Card. */
export function SortableColumnExample({
  variableHeight = false,
  onOrderChange,
}: {
  variableHeight?: boolean
  onOrderChange: (order: string[]) => void
}) {
  const [order, setOrder] = useState(cards.map((card) => card.id))
  const [preview, setPreview] = useState<{ id: string; y: number; target: number } | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const nodes = useRef(new Map<string, HTMLLIElement>())
  const gesture = useRef<{
    id: string
    y: number
    center: number
    centers: number[]
    target: number
  } | null>(null)
  const moveTo = (id: string, target: number) => {
    const from = order.indexOf(id)
    const to = Math.max(0, Math.min(order.length - 1, target))
    if (from === to) return
    const next = order.filter((item) => item !== id)
    next.splice(to, 0, id)
    setOrder(next)
    onOrderChange(next)
    setAnnouncement(
      `${cards.find((card) => card.id === id)!.title} moved to position ${to + 1} of ${order.length}.`,
    )
  }
  return (
    <div className="w-full">
      <p className="mb-4 text-[13px] text-ink-soft">
        Drag a handle to reorder. Use ↑ / ↓ for one position at a time.
      </p>
      <ol aria-label="Dashboard cards" className="flex list-none flex-col gap-3 p-0">
        {order.map((id, index) => {
          const card = cards.find((item) => item.id === id)!
          const active = preview?.id === id
          const target = preview && preview.id !== id && preview.target === index
          return (
            <li
              key={id}
              ref={(node) => {
                if (node) nodes.current.set(id, node)
                else nodes.current.delete(id)
              }}
              className={`relative ${active ? 'z-20' : ''}`}
            >
              {target && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-0 left-0 h-0.5 bg-brand-solid ${preview.target < order.indexOf(preview.id) ? '-top-2' : '-bottom-2'}`}
                />
              )}
              <Card
                title={card.title}
                draggable
                dragLabel={`Move ${card.title}`}
                dragDescription="Drag then release to reorder. Escape cancels. Up or Down moves one position."
                style={active ? { transform: `translateY(${preview.y}px)` } : undefined}
                onMoveStart={() => {
                  const rects = order.map((item) =>
                    nodes.current.get(item)!.getBoundingClientRect(),
                  )
                  const centers = rects.map((rect) => rect.top + rect.height / 2)
                  gesture.current = { id, y: 0, center: centers[index], centers, target: index }
                  setPreview({ id, y: 0, target: index })
                }}
                onMove={(delta) => {
                  const drag = gesture.current
                  if (!drag) {
                    if (delta.y) moveTo(id, index + Math.sign(delta.y))
                    return
                  }
                  drag.y += delta.y
                  drag.target = drag.centers.filter(
                    (center, i) => i !== index && center < drag.center + drag.y,
                  ).length
                  setPreview({ id, y: drag.y, target: drag.target })
                }}
                onMoveEnd={(cancelled) => {
                  const drag = gesture.current
                  gesture.current = null
                  setPreview(null)
                  if (drag && !cancelled) moveTo(id, drag.target)
                  if (cancelled) setAnnouncement('Move cancelled. Order unchanged.')
                }}
                actions={[
                  {
                    id: 'up',
                    label: 'Move up',
                    disabled: index === 0,
                    onSelect: () => moveTo(id, index - 1),
                  },
                  {
                    id: 'down',
                    label: 'Move down',
                    disabled: index === order.length - 1,
                    onSelect: () => moveTo(id, index + 1),
                  },
                ]}
              >
                <p className="text-[13px] text-ink-soft">{card.body}</p>
                {variableHeight && id === 'reports' && (
                  <ul className="mt-3 space-y-3 border-t border-line pt-3 text-[13px] text-ink">
                    <li>Monthly usage summary</li>
                    <li>New tenant onboarding</li>
                    <li>Permissions audit</li>
                  </ul>
                )}
              </Card>
            </li>
          )
        })}
      </ol>
      <p role="status" className="mt-4 min-h-5 text-[12px] text-ink-soft">
        {announcement ||
          `Order: ${order.map((id) => cards.find((card) => card.id === id)!.title).join(' → ')}`}
      </p>
    </div>
  )
}
