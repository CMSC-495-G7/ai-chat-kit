import { useState } from 'react'
import { CheckIcon, ChevronRightIcon, XIcon } from '../../../primitives/icons'
import { useUiSize } from '../../../lib/uiSize'
import type { ToolCallChipProps } from './types'

/**
 * One tool call as a status chip: pulsing while running, check when done,
 * red with the failure reason when it fails. Finished calls expand to show
 * their input/output JSON.
 */
export function ToolCallChip({ tool }: ToolCallChipProps) {
  const compact = useUiSize() === 'compact'
  const [open, setOpen] = useState(false)

  const running = tool.status === 'started'
  const failed = tool.status === 'failed'
  const expandable = !running && (tool.input !== undefined || tool.output !== undefined)

  return (
    <div>
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        aria-expanded={expandable ? open : undefined}
        className={`flex items-center gap-1.5 rounded-control border font-medium transition ${
          compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-[13px]'
        } ${
          failed ? 'border-danger/30 bg-danger/8 text-danger-fg-soft' : 'border-line text-ink-soft'
        } ${expandable ? 'cursor-pointer hover:bg-tint/6' : 'cursor-default'}`}
      >
        {running ? (
          <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
        ) : failed ? (
          <XIcon width={13} height={13} aria-hidden />
        ) : (
          <CheckIcon width={13} height={13} className="text-accent" aria-hidden />
        )}

        {running ? (
          <span className="shimmer-text">Running {tool.name}…</span>
        ) : (
          <span className="font-mono">{tool.name}</span>
        )}

        {expandable && (
          <ChevronRightIcon
            width={12}
            height={12}
            className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            aria-hidden
          />
        )}
      </button>

      {failed && tool.error && (
        <p className={`mt-1 pl-1 text-danger-fg-soft/90 ${compact ? 'text-xs' : 'text-[13px]'}`}>
          {tool.error}
        </p>
      )}

      {expandable && open && (
        <div className={`turn-rail mt-1.5 space-y-1.5 ${compact ? 'pl-3' : 'pl-4'}`}>
          {tool.input !== undefined && <ToolPayload label="Input" value={tool.input} />}
          {tool.output !== undefined && <ToolPayload label="Output" value={tool.output} />}
        </div>
      )}
    </div>
  )
}

function ToolPayload({ label, value }: { label: string; value: unknown }) {
  const compact = useUiSize() === 'compact'
  return (
    <div>
      <span className={`font-medium text-ink-soft ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {label}
      </span>
      <pre
        className={`overflow-x-auto font-mono whitespace-pre-wrap text-ink-soft ${compact ? 'text-[11px]' : 'text-xs'}`}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}
