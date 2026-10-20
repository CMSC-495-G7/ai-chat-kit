// The product name and the signed-in viewer the platform recipes show.

export const APP_NAME = 'Assistant'

/**
 * The signed-in viewer. Fictional, but held in one place because two surfaces
 * render it now — the sidebar's account button and the user-settings dialog it
 * opens — and they must not drift apart.
 */
export const DEMO_USER = {
  name: 'John Ozzo',
  /** Drawn in the avatar; a real app derives or uploads this. */
  initials: 'JO',
  email: 'john.ozzo@alderfinch.example',
  plan: 'Performance plan',
}
