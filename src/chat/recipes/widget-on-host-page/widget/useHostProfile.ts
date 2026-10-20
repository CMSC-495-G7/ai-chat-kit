import { useEffect, useState } from 'react'

export type HostProfile = { name: string; loginId: string }

// The host page exposes user data by tagging elements with these attributes;
// the widget reads them from the surrounding document. Works for form inputs
// (reads .value) or any element (reads .textContent).
const NAME_SELECTOR = '[data-chat-profile="name"]'
const ID_SELECTOR = '[data-chat-profile="id"]'

function readValue(selector: string): string {
  const el = document.querySelector(selector)
  if (!el) return ''
  const raw =
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      ? el.value
      : (el.textContent ?? '')
  return raw.trim()
}

/**
 * Mocks the widget pulling data out of the page it's embedded on: it queries
 * the host document for the tagged profile elements and reflects their values
 * live — type in a host form field and the widget updates. Runs from inside
 * the shadow root because `document` is the shared host document.
 */
export function useHostProfile(): HostProfile {
  const [profile, setProfile] = useState<HostProfile>(() => ({
    name: readValue(NAME_SELECTOR),
    loginId: readValue(ID_SELECTOR),
  }))

  useEffect(() => {
    const update = () => {
      const next = { name: readValue(NAME_SELECTOR), loginId: readValue(ID_SELECTOR) }
      setProfile((prev) => (prev.name === next.name && prev.loginId === next.loginId ? prev : next))
    }
    update()
    // Host form typing (input bubbles/composes) and DOM swaps of tagged nodes.
    document.addEventListener('input', update)
    const observer = new MutationObserver(update)
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })
    return () => {
      document.removeEventListener('input', update)
      observer.disconnect()
    }
  }, [])

  return profile
}
