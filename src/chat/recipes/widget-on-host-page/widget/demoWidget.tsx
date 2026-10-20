import { SparkleIcon } from '../../../../primitives/icons'
import {
  mountWidget,
  type MountOptions,
  type ThemeMode,
  type WidgetContent,
  type WidgetHandle,
  type WidgetPosition,
} from '../../../components/chat-widget'
import { createCannedResponder, type Responder } from '../../../engine/chatEngine'
import { type SidePanel } from '../../../engine/types'
// Not ai-chat-kit/widget.css: the side panels below render inside the
// shadow root, so this sheet also scans this folder. See widget.css.
import { cannedTurns } from '../../../fixtures/cannedTurns'
import { demoBranding } from '../../../fixtures/config'
import { todaysSuggestions, typeaheadPool } from '../../../fixtures/suggestions'
import { useDemoComposerFeatures } from '../../shared/demoFeatures'
import { useDemoScope } from '../../shared/useDemoFacets'
import { DemoFacetFiltersPanel, DemoPersonaPanel, FiltersRailIcon } from './sidePanels'
import { useHostProfile } from './useHostProfile'
import cssText from './widget.css?inline'

// Short starters sized for the narrow panel — the full Hero doesn't fit here.
const starters: string[] = []

// The demo's side-rail tabs, injected into the (generic) library widget.
function buildSidePanels(): SidePanel[] {
  return [
    {
      id: 'filters',
      label: 'Filters',
      // Carries its own badge rather than taking the rail's: the rail's is a
      // number fixed when the widget mounts, and this one changes every tick.
      icon: <FiltersRailIcon />,
      title: 'Filters',
      // The body pins a footer, so it lays itself out.
      fill: true,
      content: ({ close }) => <DemoFacetFiltersPanel onDone={close} />,
    },
    {
      id: 'persona',
      label: 'Persona',
      icon: <SparkleIcon width={16} height={16} />,
      title: 'Persona selection',
      content: <DemoPersonaPanel />,
    },
  ]
}

// Assemble the demo-specific content that makes the library widget concrete.
function buildContent(responder: Responder = createCannedResponder(cannedTurns)): WidgetContent {
  return {
    responder,
    branding: demoBranding,
    suggestions: todaysSuggestions,
    typeaheadPool,
    useFeatures: useDemoComposerFeatures,
    starters,
    sidePanels: buildSidePanels(),
    launcherLabel: 'Ask Assistant',
    useProfile: useHostProfile,
    // Read inside the widget so the recorded scope, and the "changed since"
    // badge on older questions, stay live as the Filters panel is used.
    useScope: useDemoScope,
  }
}

export type DemoChatOptions = Omit<MountOptions, 'cssText'> & {
  /** Where answers come from. Defaults to the canned turns, replayed locally. */
  responder?: Responder
}
export type DemoChatHandle = WidgetHandle

/** Mount the Assistant chat widget. Returns a handle to control or remove it. */
export function init({ responder, ...options }: DemoChatOptions = {}): DemoChatHandle {
  return mountWidget(buildContent(responder), { ...options, cssText })
}

// Auto-init when loaded via a classic script tag carrying data-auto-init:
//   <script src=".../chat-widget.js" data-auto-init data-theme="auto"
//           data-theme-class="chat-theme-deep"></script>
// or with a custom palette from seed colours instead of a theme class:
//   <script src=".../chat-widget.js" data-auto-init
//           data-brand="#0f766e" data-accent="#0f766e" data-warm="#0f766e"></script>
// (document.currentScript is null in module scripts, so this requires a
// classic tag; module consumers call init() themselves.)
const script = document.currentScript as HTMLScriptElement | null
if (script && script.dataset.autoInit !== undefined) {
  const { brand, accent, warm } = script.dataset
  const boot = () =>
    init({
      theme: script.dataset.theme as ThemeMode | undefined,
      themeClass: script.dataset.themeClass,
      palette: brand ? { brand, accent, warm } : undefined,
      position: script.dataset.position as WidgetPosition | undefined,
    })
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true })
  } else {
    boot()
  }
}
