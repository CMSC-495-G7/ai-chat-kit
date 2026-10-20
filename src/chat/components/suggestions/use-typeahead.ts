import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'
import { readString, resolveStorage, write } from '../../../lib/settings'
import type { Suggestion } from '../../engine/types'
import { completionFor, matchSuggestions } from './match'
import type { SuggestionListProps } from './types'

export type UseTypeaheadOptions = {
  /** The draft, owned by the input this drives. */
  value: string
  /** Replace the draft — what accepting a suggestion does. */
  onAccept: (text: string) => void
  /** Today's list: shown on an empty draft, searched first when typing. */
  suggestions: Suggestion[]
  /** More to match against once the reader types. */
  pool?: Suggestion[]
  /** Persists the on/off switch. Omitted, it lasts for the session only. */
  storageKey?: string
  /** How many matches to show at most. */
  limit?: number
}

export type TypeaheadValue = {
  /** Suggest-as-you-type is switched on. */
  enabled: boolean
  setEnabled: (on: boolean) => void
  /** Props for the floating SuggestionList, or null while it is hidden. */
  list: Omit<SuggestionListProps, 'compact' | 'placement'> | null
  /** The rest of the best match after the draft — drawn after the caret. */
  ghost: string
  /** Spread onto the input: focus tracking and the listbox wiring. */
  inputProps: {
    onFocus: () => void
    onBlur: () => void
    'aria-controls': string | undefined
    'aria-activedescendant': string | undefined
  }
  /** Call from the input's onChange: typing resets the list. */
  onInput: () => void
  /** Call first in the input's onKeyDown. True when the key was the list's
   *  (arrows, Tab, Enter on a highlighted row, Esc) and must go no further. */
  onKeyDown: (e: KeyboardEvent) => boolean
  /** Forget the highlighted row — after the draft is sent, say. */
  reset: () => void
}

/**
 * Suggest-as-you-type for any text input: one surface in two states. With
 * focus on an empty draft it shows today's suggestions; typing narrows them
 * to matches, and the best match's remainder shows as ghost text.
 *
 * Headless — it owns the state and the keys; the host renders a
 * SuggestionList from `list` and the ghost however suits its input.
 */
export function useTypeahead({
  value,
  onAccept,
  suggestions,
  pool = [],
  storageKey,
  limit = 4,
}: UseTypeaheadOptions): TypeaheadValue {
  const [enabled, setEnabled] = useState(
    () => readString(resolveStorage(), storageKey ?? null) === '1',
  )
  useEffect(() => {
    write(resolveStorage(), storageKey ?? null, enabled ? '1' : '0')
  }, [enabled, storageKey])

  const [focused, setFocused] = useState(false)
  // Esc hides the list until the draft next changes.
  const [dismissed, setDismissed] = useState(false)
  // The row under the keyboard; -1 until the reader arrows into the list.
  const [active, setActive] = useState(-1)
  const id = useId()

  const everything = useMemo(() => [...suggestions, ...pool], [suggestions, pool])
  const typed = value.trim() !== ''
  const items = useMemo(
    () => (typed ? matchSuggestions(everything, value, limit) : suggestions),
    [typed, everything, value, limit, suggestions],
  )
  const open = enabled && focused && !dismissed && items.length > 0
  const at = Math.min(active, items.length - 1)
  // Ghost text completes the highlighted match, or the best one if none is.
  const ghost = open && typed ? completionFor(items[Math.max(at, 0)]?.text, value) : ''

  const accept = (text: string) => {
    onAccept(text)
    setActive(-1)
  }

  return {
    enabled,
    setEnabled,
    list: open
      ? {
          id,
          label: typed ? 'Matches' : 'Suggested for today',
          items,
          query: value,
          active: at,
          onPick: accept,
        }
      : null,
    ghost,
    inputProps: {
      onFocus: () => setFocused(true),
      onBlur: () => {
        setFocused(false)
        setActive(-1)
      },
      'aria-controls': open ? id : undefined,
      'aria-activedescendant': open && at >= 0 ? `${id}-${at}` : undefined,
    },
    onInput: () => {
      setActive(-1)
      setDismissed(false)
    },
    onKeyDown: (e) => {
      if (!open) return false
      const n = items.length
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((at + 1) % n)
        return true
      }
      // Up on an empty draft is left to the host (the composer hands it to
      // the queue), unless the reader is already walking the list.
      if (e.key === 'ArrowUp' && (typed || at >= 0)) {
        e.preventDefault()
        setActive(at === 0 ? -1 : at < 0 ? n - 1 : at - 1)
        return true
      }
      if (e.key === 'Tab' && !e.shiftKey && (ghost || at >= 0)) {
        e.preventDefault()
        accept(items[Math.max(at, 0)].text)
        return true
      }
      if (e.key === 'Enter' && !e.shiftKey && at >= 0) {
        e.preventDefault()
        accept(items[at].text)
        return true
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setDismissed(true)
        setActive(-1)
        return true
      }
      return false
    },
    reset: () => setActive(-1),
  }
}
