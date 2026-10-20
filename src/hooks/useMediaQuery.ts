import { useCallback, useSyncExternalStore } from 'react'
/** Subscribe to one viewport condition; server rendering starts at the supplied fallback. */
export function useMediaQuery(query: string, fallback = false) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', notify)
      return () => media.removeEventListener('change', notify)
    },
    [query],
  )
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, snapshot, () => fallback)
}
