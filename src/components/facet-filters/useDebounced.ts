import { useEffect, useState } from 'react'

/**
 * Trailing-edge debounce. Used for the search fields: a facet lookup fires one
 * request after typing settles rather than one per keystroke, which is the
 * difference between a prefix index answering comfortably and it being asked
 * nine questions nobody is waiting for.
 */
export function useDebounced<T>(value: T, ms = 150): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return settled
}
