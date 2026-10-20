import { useState } from 'react'

const PREFIX = 'chat-tip-dismissed:'

function read(key: string): boolean {
  try {
    return localStorage.getItem(PREFIX + key) === '1'
  } catch {
    // Private browsing / storage disabled — the tip just isn't persisted.
    return false
  }
}

/**
 * Tracks whether a one-time inline tip has been dismissed, persisted in
 * localStorage per browser so it survives reloads without needing an
 * account-level setting. `key` scopes the state — each tip in the product
 * (citation discovery today, others later) gets its own key and dismisses
 * independently.
 */
export function useDismissableTip(key: string) {
  const [dismissed, setDismissed] = useState(() => read(key))

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(PREFIX + key, '1')
    } catch {
      // ignore — nothing to persist to
    }
  }

  return { dismissed, dismiss }
}
