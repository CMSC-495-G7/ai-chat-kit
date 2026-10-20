import { useState } from 'react'
import { ChevronRightIcon } from '../../../primitives/icons'
import { useUiSize } from '../../../lib/uiSize'
import type { ThinkingBlockProps } from './types'

export function ThinkingBlock({ text, active, durationSec }: ThinkingBlockProps) {
  const compact = useUiSize() === 'compact'
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-control px-1.5 py-1 font-medium transition hover:bg-tint/6 ${compact ? 'text-xs' : 'text-[13px]'}`}
      >
        <ChevronRightIcon
          width={14}
          height={14}
          className={`text-ink-soft transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
        {active ? (
          <span className="shimmer-text">Thinking…</span>
        ) : durationSec !== undefined ? (
          <span className="text-ink-soft">Thought for {durationSec}s</span>
        ) : (
          // Inactive but no duration yet means reasoning stepped aside for a
          // tool call, not that it finished — a turn can cycle through this
          // several times before the real "Thought for Ns" lands. Claiming a
          // fabricated duration here (the old `?? 4` fallback) read as done
          // when the model was about to think some more.
          <span className="text-ink-soft">Reasoning paused</span>
        )}
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className={`turn-rail mt-1.5 ${compact ? 'pl-3' : 'pl-4'}`}>
            <p
              className={`leading-relaxed whitespace-pre-line text-ink-soft italic ${compact ? 'text-xs' : 'text-[13px]'}`}
            >
              {text}
              {active && <span className="not-italic">▍</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
