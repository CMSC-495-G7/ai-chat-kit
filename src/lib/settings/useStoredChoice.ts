import { useCallback, useEffect, useRef, useState } from 'react'
import { readString, resolveStorage, write, type StorageLike } from './safeStorage'

export type UseStoredChoiceOptions<T extends string> = {
  /** What is on offer. Only the `id` is read, so this takes palettes,
   *  highlight swatches, or any `{ id }` list without a wrapper type. */
  options: readonly { id: string }[]
  /**
   * NoInfer so a literal argument does not narrow T to itself — without it,
   * `fallback: 'default'` types the setter as `(next: 'default') => void` and
   * every other id becomes a type error at the call site. Callers who do want
   * a union pass it explicitly: `useStoredChoice<PaletteId>({ … })`.
   */
  fallback: NoInfer<T>
  /** Null to keep the choice for this session only. Scope it per viewer. */
  storageKey: string | null
  storage?: StorageLike
}

/**
 * One persisted choice from a fixed set — the palette, the highlight swatch,
 * anything else that is one-of-N rather than on/off.
 *
 * Validates against `options` both on read and whenever the offer changes, so
 * a value that is no longer offered (a palette you retired, a swatch a tenant
 * has withdrawn) falls back instead of applying a class nothing defines. Same
 * rule as useFeatureFlags: what is available is decided upstream, never by
 * what happens to be in storage.
 */
export function useStoredChoice<T extends string = string>({
  options,
  fallback,
  storageKey,
  storage,
}: UseStoredChoiceOptions<T>): [T, (next: T) => void] {
  // Content, not identity — an inline `options` array must not re-run the
  // validation effect every render. Same reasoning as useFeatureFlags.
  const offered = options.map((o) => o.id).join('|')

  const read = (): T => {
    const store = resolveStorage(storage)
    const raw = readString(store, storageKey)
    return raw !== null && options.some((o) => o.id === raw) ? (raw as T) : (fallback as T)
  }

  const [value, setValue] = useState<T>(read)

  // If the offer narrows under us, fall back rather than keep applying an id
  // that is no longer on the list. Skipped on mount — `read` already did it.
  const lastOffered = useRef(offered)
  useEffect(() => {
    if (lastOffered.current === offered) return
    lastOffered.current = offered
    setValue((current) => (offered.split('|').includes(current) ? current : (fallback as T)))
  }, [offered, fallback])

  useEffect(() => {
    write(resolveStorage(storage), storageKey, value)
  }, [value, storageKey, storage])

  return [value, useCallback((next: T) => setValue(next), [])]
}
