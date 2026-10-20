import { useState } from 'react'
import { useCite } from '../../engine/citations'
import { BulbIcon, RefreshIcon, ThumbDownIcon, ThumbUpIcon } from '../../../primitives/icons'
import { IconButton } from '../../../primitives/icon-button'
import { CopyButton } from '../../../primitives/copy-button'
import { InlineTip } from '../../../primitives/inline-tip'
import { useDismissableTip } from '../../../hooks/useDismissableTip'
import { useUiSize } from '../../../lib/uiSize'
import { AskedOverStrip } from '../asked-over'
import { MessageActions } from '../message-actions'
import { Markdown } from '../markdown'
import { FollowupChips } from '../followup-chips'
import { SourceStrip } from '../source-strip'
import { ThinkingBlock } from '../thinking-block'
import { ToolCallChip } from '../tool-call-chip'
import { TurnTraceFailure, TurnTraceHandle, TurnTracePanel } from '../turn-trace'
import type { TurnTrace as Trace } from '../../engine/types'
import type { ChatMessageProps } from './types'

export function ChatMessage({
  message,
  onFollowup,
  onRetry,
  busy,
  showActions = true,
  scopeChips,
  onRestoreScope,
  showSourceTip = false,
}: ChatMessageProps) {
  const compact = useUiSize() === 'compact'
  const cite = useCite()
  const sourceTip = useDismissableTip('citation-discovery')
  // Opening a citation carries the message's highlights so the reference frame
  // can highlight the supporting passages inside the source doc. Also counts
  // as having discovered the feature, so the tip (if showing) won't return.
  const onCite = (id: number) => {
    if (!message.sources) return
    cite(message.sources, id, message.highlights)
    sourceTip.dismiss()
  }

  // A user message is only ever in the transcript because its turn has
  // started — anything still waiting lives in the queue dock, not here.
  if (message.role === 'user') {
    const askedOver = message.askedOver
    return (
      // `group/turn` is what the actions row reveals against: the target is
      // the whole turn, not the button, which would otherwise only appear
      // once the pointer had already found it.
      <div className="group/turn flex flex-col items-end gap-1 animate-fade-up">
        {/* Above the bubble, because it qualifies the question rather than
            following from it — and outside it, because nothing gets to
            reflow the sentence the person wrote. */}
        {askedOver && (
          <AskedOverStrip
            scope={askedOver}
            current={scopeChips}
            onRestore={onRestoreScope ? () => onRestoreScope(askedOver) : undefined}
            density={compact ? 'compact' : 'comfortable'}
          />
        )}
        <div
          className={`${
            compact
              ? 'max-w-[85%] rounded-control rounded-br-xs bg-bubble px-3.5 py-2 text-sm leading-relaxed text-on-bubble shadow-md shadow-(color:--shadow-bubble)'
              : 'max-w-[78%] rounded-surface rounded-br-sm bg-bubble px-5 py-3 text-[15px] leading-relaxed text-on-bubble shadow-md shadow-(color:--shadow-bubble)'
          }`}
        >
          {message.content}
        </div>
        {showActions && (
          <MessageActions reveal>
            <CopyButton
              text={message.content}
              label="Copy question"
              size={compact ? 'sm' : 'md'}
              iconSize={compact ? 13 : 14}
            />
          </MessageActions>
        )}
      </div>
    )
  }

  return (
    <div className={`flex animate-fade-up ${compact ? 'gap-2.5' : 'gap-3.5'}`}>
      <span
        className={`orb mt-1 block shrink-0 rounded-full ${compact ? 'size-6' : 'size-7'} ${message.streaming || message.thinkingActive ? 'animate-orb-drift' : ''}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1 pt-0.5">
        {message.thinking && (
          <ThinkingBlock
            text={message.thinking}
            active={!!message.thinkingActive}
            durationSec={message.thinkingSec}
          />
        )}

        {message.tools && message.tools.length > 0 && (
          <div className="mb-3 flex flex-col items-start gap-1.5">
            {message.tools.map((tool) => (
              <ToolCallChip key={tool.toolCallId} tool={tool} />
            ))}
          </div>
        )}

        {message.content && (
          <div
            className={
              compact
                ? 'max-w-[68ch] text-sm leading-[1.65] text-ink'
                : 'max-w-[68ch] text-[15px] leading-[1.75] text-ink'
            }
          >
            <Markdown
              text={message.content}
              streaming={message.streaming}
              sources={message.sources}
              onCite={onCite}
              // Feeds the citation chips' hover previews. Safe to pass here
              // only because `activeRef` stays null: these offsets index the
              // SOURCE documents, not this answer, and rangesForReference
              // returns [] for a null reference, so nothing in the answer is
              // marked. Setting `activeRef` on an answer would mark the answer
              // text at source-document offsets.
              highlights={message.highlights}
            />
          </div>
        )}

        {showSourceTip &&
          !message.streaming &&
          !sourceTip.dismissed &&
          message.sources &&
          message.sources.length > 0 && (
            <div className="mt-3 max-w-[68ch]">
              <InlineTip icon={<BulbIcon width={16} height={16} />} onDismiss={sourceTip.dismiss}>
                Numbered citations like <b className="font-semibold">[{message.sources[0].id}]</b>,
                and the sources below, open the original — click one to see exactly where this
                answer comes from.
              </InlineTip>
            </div>
          )}

        {message.stopped && (
          <p className={`mt-2 italic text-ink-soft ${compact ? 'text-[11px]' : 'text-xs'}`}>
            Stopped
          </p>
        )}

        {!message.streaming && message.sources && message.sources.length > 0 && (
          <SourceStrip sources={message.sources} onCite={onCite} />
        )}

        {/* Only a turn that produced no answer lands here — a recoverable
            hiccup is recorded on the trace instead, so a good answer is never
            wrapped in a red box. */}
        {message.error && (
          <TurnTraceFailure
            reason={message.error.message}
            trace={message.trace}
            onRetry={onRetry && (() => onRetry(message.id))}
            busy={busy}
          />
        )}

        {/* A failed turn is deliberately excluded: its own block owns the
            recovery action, and a Regenerate button sitting under a Retry makes
            two controls compete for the same job. Recovered turns are unaffected
            — a hiccup no longer sets `error`, so they keep their actions. */}
        {showActions &&
          !message.streaming &&
          !message.thinkingActive &&
          !message.error &&
          message.content && <ActionRow content={message.content} trace={message.trace} />}

        {onFollowup && !message.streaming && message.followups && message.followups.length > 0 && (
          <FollowupChips items={message.followups} onPick={onFollowup} disabled={busy} />
        )}
      </div>
    </div>
  )
}

function ActionRow({ content, trace }: { content: string; trace?: Trace }) {
  const compact = useUiSize() === 'compact'
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  // Held here rather than inside TurnTrace so the handle can sit at the row's
  // right edge while its panel expands full-width underneath.
  const [traceOpen, setTraceOpen] = useState(false)

  const iconSize = compact ? 14 : 15
  const actionSize = compact ? 'sm' : 'md'

  return (
    <div className="mt-3">
      {/* gap-1 rather than gap-0.5: the targets are 36px now, and abutting hit
          areas make a mis-tap land on the neighbouring action. */}
      <div className="flex items-center gap-1">
        <CopyButton text={content} label="Copy response" size={actionSize} iconSize={iconSize} />
        <IconButton
          shape="rounded"
          size={actionSize}
          aria-label="Regenerate response"
          title="Regenerate"
        >
          <RefreshIcon width={iconSize} height={iconSize} />
        </IconButton>
        <IconButton
          shape="rounded"
          size={actionSize}
          active={vote === 'up'}
          onClick={() => setVote(vote === 'up' ? null : 'up')}
          aria-label="Good response"
          aria-pressed={vote === 'up'}
          title="Good response"
        >
          <ThumbUpIcon width={iconSize} height={iconSize} />
        </IconButton>
        <IconButton
          shape="rounded"
          size={actionSize}
          active={vote === 'down'}
          onClick={() => setVote(vote === 'down' ? null : 'down')}
          aria-label="Poor response"
          aria-pressed={vote === 'down'}
          title="Poor response"
        >
          <ThumbDownIcon width={iconSize} height={iconSize} />
        </IconButton>

        {trace && (
          <div className="ml-auto">
            <TurnTraceHandle
              trace={trace}
              open={traceOpen}
              onToggle={() => setTraceOpen((o) => !o)}
            />
          </div>
        )}
      </div>

      {trace && <TurnTracePanel trace={trace} open={traceOpen} />}
    </div>
  )
}
