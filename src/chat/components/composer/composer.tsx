import { useEffect, useRef, useState } from 'react'
import { useBranding } from '../../engine/branding'
import { useAutoGrowTextarea } from '../../../hooks/useAutoGrowTextarea'
import {
  CheckIcon,
  CollapseVerticalIcon,
  ExpandVerticalIcon,
  MicIcon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  SendToQueueIcon,
  StopIcon,
} from '../../../primitives/icons'
import { IconButton } from '../../../primitives/icon-button'
import { useUiSize, type UiSize } from '../../../lib/uiSize'
import { keyLabels } from '../../../lib/keyLabels'
import { Pill } from '../../../primitives/pill'
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition'
import { QueueToggle } from '../queue-dock'
import { SuggestionList, SuggestionsMenu, useTypeahead } from '../suggestions'
import type { ComposerProps } from './types'

// Textarea growth behavior per density. `expandThreshold` is the draft length
// at which the expand button appears; `expandedCap` is the max height while
// expanded. Compact caps are fixed because the widget panel is ~660px tall.
const SIZING: Record<
  UiSize,
  { expandThreshold: number; collapsed: number; expandedCap: () => number }
> = {
  default: {
    expandThreshold: 200,
    collapsed: 180,
    expandedCap: () => window.innerHeight * 0.65,
  },
  compact: {
    expandThreshold: 120,
    collapsed: 100,
    expandedCap: () => 240,
  },
}

export function Composer({
  docked,
  disabled = false,
  streaming = false,
  onStop,
  onSubmit,
  onArrowUp,
  queueing = true,
  chain,
  suggestions = [],
  typeaheadPool,
  typeaheadStorageKey,
  onDraftChange,
}: ComposerProps) {
  const { appName } = useBranding()
  const size = useUiSize()
  const compact = size === 'compact'
  const sizing = SIZING[size]

  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)

  const hasDraft = value.trim().length > 0
  const canExpand = value.length >= sizing.expandThreshold
  // Only honor the expanded state while the draft is long enough to warrant it.
  const expandedHeight = expanded && canExpand

  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useAutoGrowTextarea(value, expandedHeight, sizing)
  const planning = chain?.state?.phase === 'planning'
  const hasSuggestions = suggestions.length > 0
  // Writing while an answer runs only goes anywhere if it can queue — or,
  // building a queue, if it is a question for later.
  const canSend = hasDraft && !disabled && (!streaming || queueing || planning)

  // A picked suggestion lands in the draft, never sends itself: the reader
  // may want to adjust it first.
  const fill = (text: string) => {
    setValue(text)
    textareaRef.current?.focus()
  }

  const typeahead = useTypeahead({
    value,
    onAccept: fill,
    suggestions,
    pool: typeaheadPool,
    storageKey: typeaheadStorageKey,
    limit: compact ? 3 : 4,
  })

  // What the draft held when the microphone opened. Dictation writes over
  // everything after it rather than appending, because the recognizer re-sends
  // the whole passage each time it emits: appending would repeat the first
  // sentence the moment a second one landed.
  const dictationBase = useRef('')
  // A held key, so a blur mid-hold can close the microphone the keyup will
  // never arrive to close.
  const keyHeld = useRef(false)

  const speech = useSpeechRecognition({
    onResult: (heard) =>
      setValue(dictationBase.current ? `${dictationBase.current} ${heard}` : heard),
  })

  // Press and hold, never a toggle: the microphone closes when the button
  // comes up, so it cannot be left open by walking away from it.
  const beginDictation = () => {
    dictationBase.current = value
    speech.start()
  }
  const endDictation = () => {
    speech.stop()
    // Hand the caret back to the draft, where the words just landed.
    textareaRef.current?.focus()
  }

  function submit(opts?: { steer?: boolean }) {
    const text = value.trim()
    if (!text || !canSend) return
    speech.stop()
    setValue('')
    setAttachments([])
    setExpanded(false)
    typeahead.reset()
    // Building a queue, Enter adds a question — and nothing steers, since
    // nothing in a queue being built is running yet.
    if (planning && chain) chain.add(text)
    else onSubmit(text, queueing ? opts : undefined)
  }

  // The dock's ghost row shows this draft taking its place at the end of the
  // queue, so it has to see every keystroke. An effect rather than a call in
  // the change handler: the draft is also written by suggestions, dictation
  // and submit, and every one of those has to reach the dock too.
  useEffect(() => {
    onDraftChange?.(value)
  }, [value, onDraftChange])

  const toolIconSize = compact ? 16 : 18

  return (
    <div
      // Named so the toolbar's triggers (and anything else nested here) can
      // query this row's actual rendered width — e.g. when a resizable panel
      // squeezes the chat column — rather than the app-wide density.
      // Relative + z-10 so the suggestion panels open over what follows it.
      className={`glass @container/composer relative z-10 w-full shadow-lg shadow-(color:--shadow-soft) transition-shadow duration-300 focus-within:shadow-xl focus-within:shadow-(color:--shadow-raised) ${
        compact ? 'rounded-control' : 'rounded-surface'
      } ${docked ? '' : 'shadow-xl'}`}
    >
      {attachments.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${compact ? 'px-3 pt-2.5' : 'px-4 pt-3'}`}>
          {attachments.map((name) => (
            <Pill
              key={name}
              size="sm"
              tone="brand"
              leadingIcon={<PaperclipIcon />}
              onClose={() => setAttachments((attachments) => attachments.filter((n) => n !== name))}
              className={compact ? 'max-w-36' : 'max-w-48'}
            >
              {name}
            </Pill>
          ))}
        </div>
      )}

      {typeahead.list && (
        <SuggestionList {...typeahead.list} compact={compact} placement={docked ? 'up' : 'down'} />
      )}

      <div className="relative">
        {/* The completion, drawn behind the transparent textarea on the same
            metrics: the typed text is invisible here and the rest shows after
            it, so it reads as sitting right after the caret. */}
        {typeahead.ghost && (
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden pb-1 leading-relaxed break-words whitespace-pre-wrap ${
              compact ? 'pt-3 pl-4 text-sm' : 'pt-4 pl-5 text-[15px]'
            } ${canExpand ? (compact ? 'pr-10' : 'pr-12') : compact ? 'pr-4' : 'pr-5'}`}
          >
            <span className="text-transparent">{value}</span>
            <span className="text-ink-soft/70">{typeahead.ghost}</span>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            typeahead.onInput()
          }}
          {...typeahead.inputProps}
          onKeyDown={(e) => {
            if (typeahead.onKeyDown(e)) return
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              // Cmd/Ctrl+Enter steers: interrupts the in-flight response and
              // sends immediately. Plain Enter queues while streaming. With
              // queueing off, Enter mid-answer does nothing; the draft waits.
              submit({ steer: e.metaKey || e.ctrlKey })
            } else if (e.key === 'ArrowUp' && value === '' && onArrowUp) {
              // Up on an empty box reaches for the last thing you wrote — here
              // that is the queue, not the history.
              e.preventDefault()
              onArrowUp()
            }
          }}
          rows={compact || docked ? 1 : 2}
          placeholder={
            speech.listening
              ? 'Listening… release to stop'
              : planning
                ? 'Add a question to the queue…'
                : 'Ask anything…'
          }
          aria-label={`Message ${appName}`}
          className={`w-full resize-none bg-transparent pb-1 leading-relaxed text-ink-strong outline-none placeholder:text-ink-soft ${
            compact ? 'pt-3 pl-4 text-sm' : 'pt-4 pl-5 text-[15px]'
          } ${canExpand ? (compact ? 'pr-10' : 'pr-12') : compact ? 'pr-4' : 'pr-5'}`}
        />

        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-pressed={expanded}
            aria-label={expanded ? 'Collapse input' : 'Expand input'}
            title={expanded ? 'Collapse' : 'Expand'}
            className={`absolute rounded-control p-1.5 text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong ${
              compact ? 'top-1.5 right-2' : 'top-2.5 right-3'
            }`}
          >
            {expanded ? (
              <CollapseVerticalIcon width={16} height={16} />
            ) : (
              <ExpandVerticalIcon width={16} height={16} />
            )}
          </button>
        )}
      </div>

      <div className={`flex items-center ${compact ? 'gap-1 px-2 pb-2' : 'gap-1.5 px-3 pb-3'}`}>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const names = Array.from(e.target.files ?? []).map((f) => f.name)
            setAttachments((prev) => [...new Set([...prev, ...names])])
            e.target.value = ''
          }}
        />
        <IconButton
          size={compact ? 'md' : 'lg'}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach files"
          title="Attach files"
        >
          <PlusIcon width={toolIconSize} height={toolIconSize} />
        </IconButton>

        {speech.supported && (
          <button
            type="button"
            // Pointer capture, so a finger that slides off the button still
            // ends the recording on release rather than stranding it open.
            onPointerDown={(e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return
              // Keeps focus in the draft and stops touch from selecting text.
              e.preventDefault()
              beginDictation()
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {
                // A tap short enough to be over already cannot be captured;
                // its own pointerup still closes the microphone.
              }
            }}
            onPointerUp={endDictation}
            onPointerCancel={endDictation}
            onLostPointerCapture={endDictation}
            // The keyboard equivalent of holding: browsers repeat keydown
            // while a key is down and fire keyup once, on release.
            onKeyDown={(e) => {
              if (e.key !== ' ' && e.key !== 'Enter') return
              e.preventDefault()
              if (e.repeat || keyHeld.current) return
              keyHeld.current = true
              beginDictation()
            }}
            onKeyUp={(e) => {
              if (e.key !== ' ' && e.key !== 'Enter') return
              keyHeld.current = false
              endDictation()
            }}
            onBlur={() => {
              if (!keyHeld.current) return
              keyHeld.current = false
              endDictation()
            }}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? 'Listening — release to stop' : 'Hold to speak'}
            title="Hold to speak — release to stop"
            className={`relative touch-none rounded-full transition ${compact ? 'p-1.5' : 'p-2'} ${
              speech.listening
                ? 'bg-brand-fg/15 text-brand-fg'
                : 'text-ink-soft hover:bg-tint/8 hover:text-ink-strong'
            }`}
          >
            {speech.listening && (
              <span
                className="absolute inset-0 animate-ping rounded-full bg-brand-fg/30"
                aria-hidden
              />
            )}
            <MicIcon width={toolIconSize} height={toolIconSize} />
          </button>
        )}

        {hasSuggestions && (
          <SuggestionsMenu
            suggestions={suggestions}
            onPick={fill}
            onQueue={chain?.add}
            typeahead={typeahead.enabled}
            onTypeaheadChange={typeahead.setEnabled}
            compact={compact}
            placement={docked ? 'up' : 'down'}
          />
        )}

        {/* Stopping and sending are different intents, so they never share a
            button — but they do belong to each other, so they stay together at
            the action end of the row. Typing while an answer runs demotes Stop
            from filled to outline and slides it one place left; it never
            crosses the row, and the pointer that was on it has barely moved. */}
        <div className={`ml-auto flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
          {chain && (
            <>
              <QueueToggle
                compact={compact}
                pressed={planning}
                onClick={planning ? chain.cancel : chain.start}
              />
              {/* Queue belongs to the draft, Send to the turn. The hairline is
                  what says they are two groups rather than two ways to send. */}
              <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-line" />
            </>
          )}

          {streaming && queueing && (hasDraft || planning) && (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop the reply"
              title="Stop the reply"
              className={`flex items-center justify-center rounded-full border border-line text-ink-strong transition hover:bg-tint/8 ${
                compact ? 'size-8' : 'size-9'
              }`}
            >
              <StopIcon width={compact ? 14 : 15} height={compact ? 14 : 15} />
            </button>
          )}

          {planning ? (
            <button
              type="button"
              onClick={() => submit()}
              disabled={!canSend}
              aria-label="Add this question to the queue"
              title={`Add to the queue (${keyLabels.enter})`}
              className={`flex items-center justify-center rounded-full bg-action text-on-action shadow-md shadow-(color:--shadow-raised) transition hover:brightness-95 disabled:bg-tint/15 disabled:text-ink-soft disabled:shadow-none ${
                compact ? 'size-8' : 'size-9'
              }`}
            >
              <PlusIcon width={compact ? 16 : 18} height={compact ? 16 : 18} />
            </button>
          ) : streaming && (!hasDraft || !queueing) ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop response"
              title="Stop response"
              className={`flex items-center justify-center rounded-full bg-action text-on-action shadow-md shadow-(color:--shadow-raised) transition hover:brightness-95 ${
                compact ? 'size-8' : 'size-9'
              }`}
            >
              <StopIcon width={compact ? 16 : 18} height={compact ? 16 : 18} />
            </button>
          ) : streaming ? (
            <SendControl
              compact={compact}
              onQueue={() => submit()}
              onSendNow={() => submit({ steer: true })}
            />
          ) : (
            <button
              type="button"
              onClick={() => submit()}
              disabled={!hasDraft || disabled}
              aria-label="Send message"
              // Disabled drops to the neutral wash rather than fading the fill.
              // --action is ember on dark (brand.css §2), and a saturated orange
              // at 35% opacity over a navy panel does not read as a dimmed
              // button — it composites to brown, which looks like a different
              // control rather than an unavailable one.
              className={`flex items-center justify-center rounded-full bg-action text-on-action shadow-md shadow-(color:--shadow-raised) transition hover:brightness-95 disabled:bg-tint/15 disabled:text-ink-soft disabled:shadow-none ${
                compact ? 'size-8' : 'size-9'
              }`}
            >
              <SendIcon width={compact ? 16 : 18} height={compact ? 16 : 18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * The primary action while an answer is running.
 *
 * One button, not two. Queue and Send now are both real choices, but only one
 * of them is what you usually mean — so the button does that, and the other
 * sits a hover (or a focus, or a long press) away, named, with its key beside
 * it. Two buttons of equal weight made the row ask a question on every
 * keystroke; this one answers it and stays out of the way.
 */
function SendControl({
  compact,
  onQueue,
  onSendNow,
}: {
  compact: boolean
  onQueue: () => void
  onSendNow: () => void
}) {
  const [open, setOpen] = useState(false)
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Escape closes the list and hands focus back to the button — whose focus
  // handler would open it straight back up. This swallows that one re-open.
  const dismissedRef = useRef(false)

  const cancelHold = () => {
    if (holdRef.current) clearTimeout(holdRef.current)
    holdRef.current = null
  }

  /** Walk the open menu. Hover opens this list too, so focus is only ever
   *  moved by a key — a pointer passing over the button must not steal it
   *  from the draft the reader is still typing. */
  const step = (delta: 1 | -1) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    )
    if (items.length === 0) return
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      at === -1 ? (delta === 1 ? 0 : items.length - 1) : (at + delta + items.length) % items.length
    items[next].focus()
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        dismissedRef.current = false
        setOpen(false)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          setOpen(false)
          dismissedRef.current = true
          triggerRef.current?.focus()
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          setOpen(true)
          // The list has to exist before focus can land in it.
          requestAnimationFrame(() => step(e.key === 'ArrowDown' ? 1 : -1))
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={onQueue}
        onFocus={() => {
          if (dismissedRef.current) {
            dismissedRef.current = false
            return
          }
          setOpen(true)
        }}
        // Touch has no hover: a long press opens the same list.
        onPointerDown={(e) => {
          if (e.pointerType !== 'touch') return
          holdRef.current = setTimeout(() => setOpen(true), 450)
        }}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Queue this message"
        title={`Queue (${keyLabels.enter}) · Send now (${keyLabels.mod}${keyLabels.enter})`}
        className={`flex items-center justify-center rounded-full bg-action text-on-action shadow-md shadow-(color:--shadow-raised) transition hover:brightness-95 ${
          compact ? 'size-8' : 'size-9'
        }`}
      >
        <SendToQueueIcon width={compact ? 16 : 18} height={compact ? 16 : 18} />
      </button>
      {open && (
        // The wrapper carries the gap as padding so crossing from button to
        // menu never leaves the hover target.
        <div ref={menuRef} className="absolute right-0 bottom-full z-30 pb-2">
          <div
            role="menu"
            aria-label="Send options"
            className="w-52 overflow-hidden rounded-control border border-line bg-panel-solid p-1.5 shadow-xl shadow-(color:--shadow-menu)"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onQueue()
              }}
              className="flex w-full items-center gap-2.5 rounded-control bg-chip/60 px-2.5 py-2 text-left transition hover:bg-chip"
            >
              <CheckIcon width={14} height={14} className="shrink-0 text-accent" />
              <span className="flex-1 text-[13px] font-bold text-ink-strong">Queue</span>
              <span className="text-[11px] font-bold text-ink-soft">{keyLabels.enter}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSendNow()
              }}
              className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left transition hover:bg-tint/8"
            >
              <SendIcon width={14} height={14} className="shrink-0 text-ink-soft" />
              <span className="flex-1 text-[13px] text-ink-strong">Send now</span>
              <span className="text-[11px] font-bold text-ink-soft">
                {keyLabels.mod}
                {keyLabels.enter}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
