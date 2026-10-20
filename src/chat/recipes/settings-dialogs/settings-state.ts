import { createContext, useContext } from 'react'
import { DEMO_PALETTES } from '../../../fixtures/palettes'
import { usePaletteChoice } from '../../../lib/palette/usePalette'
import { SHIPPED_HIGHLIGHTS } from '../../../lib/settings/appearance'
import { type FeatureCatalogue } from '../../../lib/settings/types'
import { useFeatureFlags, type FeatureFlagsValue } from '../../../lib/settings/useFeatureFlags'
import { useStoredChoice } from '../../../lib/settings/useStoredChoice'

/**
 * The demo's settings surface, built on the library's generic machinery
 * (`lib/settings`) rather than its own.
 *
 * It is written the way a real tenant configuration would be: the catalogue is data, the
 * optional sections are booleans, and every string is content. Swapping in a
 * different product means editing the two objects below and nothing else.
 */
export type DemoFeatureId =
  | 'suggestions'
  | 'queue'
  | 'thinking'
  | 'tools'
  | 'sources'
  | 'followups'
  | 'actions'
  | 'trace'

/**
 * What this viewer may switch, grouped by where the feature lands in a
 * streamed turn — the order a presenter narrates it, which is also the order
 * someone reading an answer meets it.
 *
 * A real deployment builds this per viewer: start from the full list, drop
 * what the tenant has not bought and what the viewer's role does not allow,
 * and hand the remainder to useFeatureFlags. Anything absent here cannot be
 * switched on from storage, so entitlement is decided once, here.
 */
export const DEMO_CATALOGUE: FeatureCatalogue<DemoFeatureId> = [
  {
    id: 'composer',
    title: 'Before you ask',
    description: 'What the message box offers while you write.',
    features: [
      {
        id: 'suggestions',
        label: 'Suggested questions',
        hint: 'The sparkle drop-up of today’s suggestions, and suggest-as-you-type.',
      },
      {
        id: 'queue',
        label: 'Queueing and steering',
        hint: 'Queue or interrupt while an answer runs, and chain questions to run in order.',
      },
    ],
  },
  {
    id: 'before',
    title: 'Before the answer',
    description: 'What the assistant shows while it is still working.',
    features: [
      {
        id: 'thinking',
        label: 'Reasoning',
        hint: 'The collapsible “Thought for Ns” block above the answer.',
      },
      {
        id: 'tools',
        label: 'Tool calls',
        hint: 'Status chips for each tool, expandable to their input and output.',
      },
    ],
  },
  {
    id: 'during',
    title: 'In the answer',
    description: 'What the answer itself carries.',
    features: [
      {
        id: 'sources',
        label: 'Sources and citations',
        hint: 'Inline [n] markers, the source strip, and the reference panel.',
      },
    ],
  },
  {
    id: 'after',
    title: 'After the answer',
    description: 'What a finished turn offers once the stream has stopped.',
    features: [
      {
        id: 'followups',
        label: 'Follow-up suggestions',
        hint: 'Suggested next prompts branching off the newest answer.',
      },
      {
        id: 'actions',
        label: 'Message actions',
        hint: 'Copy, regenerate, and the thumbs-up / thumbs-down vote.',
      },
      {
        id: 'trace',
        label: 'Turn details',
        hint: 'The answer’s duration, opening onto a timeline of what the turn did.',
      },
    ],
  },
]

/**
 * The appearance sections, which are optional per surface.
 *
 * Booleans rather than a fixed layout because they are not universally
 * appropriate: an internal tool wants both, a white-labelled deployment wants
 * neither (the tenant's palette is not the end user's to change), and a
 * product that ships one brand but cites heavily wants only the highlight.
 *
 * `title` and `description` are part of the shape so a tenant can retitle a
 * section without forking the component. The demo leaves them unset, which is
 * the normal case — PalettePicker and HighlightPicker carry their own copy,
 * and repeating it here would be two places to edit and one to forget.
 */
export const DEMO_APPEARANCE: Record<
  'palette' | 'highlight',
  { show: boolean; title?: string; description?: string }
> = {
  palette: {
    show: true,
    description:
      'The first three are the shipped brand.css themes and differ mostly in dark mode. Teal, Plum and Crimson are custom palettes, built at runtime from seed colours.',
  },
  highlight: { show: true },
}

/**
 * Storage keys are per surface. A real app scopes them per viewer too —
 * `demo-features:${tenantId}:${userId}` — so two accounts on one machine do
 * not inherit each other's settings.
 */
const FEATURES_KEY = 'demo-features'
const PALETTE_KEY = 'chat-brand-theme'
const HIGHLIGHT_KEY = 'demo-highlight'

/** Named once: these are both the hydration fallback and what "Reset
 *  appearance" restores, and the two drifting apart is a silent bug. */
const DEFAULT_PALETTE = 'default'
const DEFAULT_HIGHLIGHT = 'orange'

export type DemoFeaturesValue = FeatureFlagsValue<DemoFeatureId> & {
  highlight: string
  setHighlight: (id: string) => void
  palette: string
  setPalette: (id: string) => void
  /** Appearance only. The feature flags have their own `reset`, because the
   *  two now live behind separate entries in the account menu and a reset in
   *  one dialog must not silently undo the other's. */
  resetAppearance: () => void
}

/** Owns the settings state and its persistence. Called once, by the app shell
 *  — which needs the flags in its own render as well as providing them below. */
export function useDemoFeatureState(): DemoFeaturesValue {
  const features = useFeatureFlags<DemoFeatureId>({
    catalogue: DEMO_CATALOGUE,
    storageKey: FEATURES_KEY,
  })
  const [palette, setPalette] = useStoredChoice({
    options: DEMO_PALETTES,
    fallback: DEFAULT_PALETTE,
    storageKey: PALETTE_KEY,
  })
  const [highlight, setHighlight] = useStoredChoice({
    options: SHIPPED_HIGHLIGHTS,
    fallback: DEFAULT_HIGHLIGHT,
    storageKey: HIGHLIGHT_KEY,
  })

  // On <html>, next to dark/light: `body` paints var(--canvas), which resolves
  // at :root. index.html applies the same stored value before first paint so
  // a reload does not flash the default palette. A custom palette goes on
  // the same element, as inline variables.
  usePaletteChoice(DEMO_PALETTES, palette)

  return {
    ...features,
    palette,
    setPalette,
    highlight,
    setHighlight,
    resetAppearance: () => {
      setPalette(DEFAULT_PALETTE)
      setHighlight(DEFAULT_HIGHLIGHT)
    },
  }
}

/**
 * The composer's switches, read on their own — for the embedded widget, which
 * mounts outside the app shell's provider. Same catalogue and key, so the
 * choices made in the full app carry over.
 */
const DemoFeaturesContext = createContext<DemoFeaturesValue | null>(null)

export const DemoFeaturesProvider = DemoFeaturesContext.Provider

export function useDemoFeatures(): DemoFeaturesValue {
  const value = useContext(DemoFeaturesContext)
  if (!value) throw new Error('useDemoFeatures must be used inside DemoFeaturesProvider')
  return value
}
