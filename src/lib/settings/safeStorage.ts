/**
 * The one place that knows storage can fail.
 *
 * `window.localStorage` is not merely absent under SSR — reading the property
 * itself throws in a partitioned or cookie-blocked context, and `setItem`
 * throws on quota and in some private modes. A settings panel that cannot
 * reach its store should still render with defaults rather than take the page
 * down, so every accessor here fails soft and returns null.
 *
 * Consumers pass their own `storage` (a server-backed preference store, say)
 * and get the same guarantees for free.
 */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function resolveStorage(custom?: StorageLike): StorageLike | null {
  if (custom) return custom
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readString(storage: StorageLike | null, key: string | null): string | null {
  if (!storage || !key) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/** Returns null for missing, unreadable, or unparseable values alike — every
 *  caller's response to all three is the same: fall back to defaults. */
export function readJSON<T>(storage: StorageLike | null, key: string | null): T | null {
  const raw = readString(storage, key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Best-effort. A failed write means the setting applies for this session but
 *  will not survive — which is better than throwing out of a render effect. */
export function write(storage: StorageLike | null, key: string | null, value: string): void {
  if (!storage || !key) return
  try {
    storage.setItem(key, value)
  } catch {
    // Quota, private mode, a storage partition that denies access.
  }
}
