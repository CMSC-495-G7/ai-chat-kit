import { useId } from 'react'
import type { FeatureDescriptor } from '../../../lib/settings/types'
import type { FeatureTogglesProps } from '../types'

/**
 * The switch list for a feature catalogue — sections, each with a heading, an
 * optional description, and its rows.
 *
 * Presentational and entirely data-driven: it renders the sections it is
 * handed, in order, and nothing else. There is no dialog, header or reset
 * button here on purpose — every product wants its own settings shell, and an
 * inherited one is the part people end up fighting.
 *
 * Entitlement is not this component's job. A feature the tenant does not have
 * is absent from the catalogue, so it cannot render; a feature they have but
 * may not change carries `locked`. A section left empty by that filtering
 * renders nothing at all, which is what lets one catalogue be narrowed per
 * viewer without leaving headings over blank space.
 */
export function FeatureToggles<Id extends string = string>({
  catalogue,
  flags,
  onChange,
  intro,
  spine = false,
}: FeatureTogglesProps<Id>) {
  const sections = catalogue.filter((s) => s.features.length > 0)
  if (sections.length === 0) return null

  return (
    <div>
      {intro && <p className="mb-3 text-xs leading-snug text-ink-soft">{intro}</p>}
      {/* ink-soft rather than --line: at 10% alpha in the light theme a --line
          hairline vanishes, and this one carries structure. */}
      <div className={spine ? 'ml-1 border-l border-ink-soft/25 pl-5' : undefined}>
        {sections.map((section) => (
          <section key={section.id} className="relative pb-5 last:pb-0">
            {spine && (
              // -left-6 puts the node's centre on the spine: pl-5 (20px) plus
              // the 1px border, less half the node.
              <span
                aria-hidden
                className="absolute top-[5px] -left-6 size-[7px] rounded-full border border-ink-soft/30 bg-panel-solid"
              />
            )}
            <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
              {section.title}
            </h3>
            {section.description && (
              <p className="mt-1 text-xs leading-snug text-ink-soft">{section.description}</p>
            )}
            <div className="mt-1.5 -ml-2">
              {section.features.map((feature) => (
                <FeatureRow
                  key={feature.id}
                  feature={feature}
                  on={flags[feature.id] === true}
                  onChange={onChange}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function FeatureRow<Id extends string>({
  feature,
  on,
  onChange,
}: {
  feature: FeatureDescriptor<Id>
  on: boolean
  onChange: (id: Id, on: boolean) => void
}) {
  const { id, label, hint, locked, lockedReason } = feature
  // Not derived from the feature id: two panels on one page (a settings dialog
  // and an onboarding step, say) would then mint the same DOM id and the
  // description would resolve to whichever rendered first.
  const reasonId = useId()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={locked}
      // The reason is announced with the row rather than left in a title
      // attribute: "why can't I change this" is the question a locked switch
      // provokes, and a tooltip does not answer it for a screen reader.
      aria-describedby={locked && lockedReason ? reasonId : undefined}
      onClick={() => onChange(id, !on)}
      className="flex w-full items-start gap-4 rounded-control px-2 py-2 text-left transition hover:bg-tint/6 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium text-ink-strong">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{hint}</span>}
        {locked && lockedReason && (
          <span id={reasonId} className="mt-0.5 block text-xs leading-snug text-caution">
            {lockedReason}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
          on ? 'bg-accent' : 'bg-tint/25'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-panel-solid ring-1 shadow-sm transition-transform ${
            on ? 'translate-x-4 ring-accent/40' : 'ring-line'
          }`}
        />
      </span>
    </button>
  )
}
