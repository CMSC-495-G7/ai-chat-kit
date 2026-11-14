import type { ReactNode } from 'react'

/** One active filter, drawn inside the field. */
export type OmniboxChip = {
  id: string
  /** Dimmed qualifier before the value — `status:`. */
  prefix?: string
  label: ReactNode
  /** Names the remove button when `label` is not plain text — "Remove status: Active". */
  removeLabel?: string
  /**
   * The whole chip as plain text, shown on hover. A chip never grows past its
   * field: a long one ends in an ellipsis, and this is how to read the rest.
   */
  title?: string
  onRemove?: () => void
}

export type OmniboxSuggestion = {
  id: string
  icon?: ReactNode
  label: ReactNode
  /**
   * The query this would produce — `?search=cres`, `name__icontains`.
   *
   * Shown right-aligned and quiet. It is not decoration: the whole promise of
   * this control is that typing does something predictable, and naming the
   * parameter is how someone learns which of these two very similar-looking
   * options they actually want.
   */
  hint?: string
  onSelect: () => void
}

export type OmniboxGroup = {
  id: string
  label: string
  items: OmniboxSuggestion[]
}

export type OmniboxProps = {
  /** Visually hidden. The field still needs an accessible name. */
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  chips?: OmniboxChip[]
  groups?: OmniboxGroup[]
  /**
   * Backspace in an empty field removes the last chip. Omit and it does
   * nothing — a destructive default is only safe where chips are cheap to
   * put back.
   */
  onRemoveLast?: () => void
  /** A `⌘K` badge, a count — rendered at the right edge of the field. */
  suffix?: ReactNode
  /**
   * What to offer when the field is empty and focused, instead of nothing — a
   * row of quick picks for each filter, say. It shows until something is typed;
   * typing swaps it for `groups`.
   *
   * Pass a function to get `close`, so a pick that moves on to something else
   * (opening a panel) can dismiss the dropdown first. Arrow keys move between
   * its buttons and Escape returns to the field.
   */
  quick?: ReactNode | ((api: { close: () => void }) => ReactNode)
  /**
   * Called when the dropdown appears or goes away. A host that floats something
   * else under the field — a filter panel — closes it on `true`, or the two
   * would be drawn on top of one another.
   */
  onMenuChange?: (shown: boolean) => void
  /**
   * A letter that focuses the field with ⌘ or Ctrl held — `k` for ⌘K. Omit and
   * there is no shortcut. The badge in `suffix` is the host's to draw.
   */
  shortcut?: string
  /** Keyboard legend under the suggestions. Pass `null` to drop it. */
  hints?: ReactNode
  className?: string
}
