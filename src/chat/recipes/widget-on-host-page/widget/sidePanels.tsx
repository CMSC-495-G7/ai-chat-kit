import { useState } from 'react'
import { FacetFilters } from '../../../../components/facet-filters'
import { CountBadge } from '../../../../primitives/count-badge'
import { FunnelIcon } from '../../../../primitives/icons'
import { PersonaPanel } from '../../../components/persona-panel'
import { describeFacetType, FACET_TYPES } from '../../../fixtures/facets'
import { personas } from '../../../fixtures/personas'
import { demoPromptTemplates } from '../../../fixtures/sideTabData'
import { useDemoFacetCount, useDemoFacets } from '../../shared/useDemoFacets'

// Self-contained stateful wrappers: the widget renders these inside its own
// tree, so their state lives with the widget (the imperative mount has no
// outer React parent to hold it). UI only for now.

/**
 * The same component the full-page rail uses, at compact density.
 *
 * Three differences, all props: no section header (the side-tab chrome
 * already draws one), a Done footer (the panel covers the conversation it is
 * filtering, so it has to be able to hand it back), and the compact defaults
 * — fewer groups open, shorter previews, a six-row window. Nothing is
 * re-implemented for the widget.
 */
export function DemoFacetFiltersPanel({ onDone }: { onDone: () => void }) {
  const facets = useDemoFacets()
  return (
    // The panel body is `fill`, so the padding lives here and the component
    // keeps its own scroll — which is what lets the footer stay pinned.
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
      <FacetFilters
        className="min-h-0 flex-1"
        density="compact"
        showHeader={false}
        onDone={onDone}
        groups={facets.groups}
        selection={facets.selection}
        onSelectionChange={facets.setSelection}
        total={facets.total}
        refreshing={facets.refreshing}
        scope={facets.scope}
        facetTypes={FACET_TYPES}
        describeFacetType={describeFacetType}
        customFacets={facets.customFacets}
        onAddCustomFacet={facets.addCustomFacet}
        onRemoveCustomFacet={facets.removeCustomFacet}
        queries={facets.queries}
        onAddQuery={facets.addQuery}
        onRemoveQuery={facets.removeQuery}
        onSearchGroup={facets.onSearchGroup}
        onLoadMore={facets.onLoadMore}
        onLoadAll={facets.onLoadAll}
        pageSize={facets.pageSize}
        onClearAll={facets.clearAll}
      />
    </div>
  )
}

/**
 * The rail's Filters glyph, carrying its own live badge.
 *
 * The rail's built-in badge is baked in when the widget mounts, and this
 * count changes constantly. Subscribing here keeps "four filters are shaping
 * every answer" true while the panel is shut — which is the only reason the
 * badge exists.
 */
export function FiltersRailIcon() {
  const count = useDemoFacetCount()
  return (
    <span className="relative grid place-items-center">
      <FunnelIcon width={16} height={16} />
      <CountBadge count={count} placement="corner" />
    </span>
  )
}

export function DemoPersonaPanel() {
  // Only the persona is stateful — the prompt stack is read-only here.
  const [personaId, setPersonaId] = useState(personas[0].id)
  return (
    <PersonaPanel
      personas={personas}
      personaId={personaId}
      onPersonaChange={setPersonaId}
      templates={demoPromptTemplates}
    />
  )
}
