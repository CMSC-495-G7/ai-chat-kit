import { useId } from 'react'
import { useBranding } from '../../engine/branding'
import { useAutoGrowTextarea } from '../../../hooks/useAutoGrowTextarea'
import { ChevronDownIcon } from '../../../primitives/icons'
import type { PromptTemplate } from '../../engine/types'
import type { PersonaPanelProps } from './types'

// Each layer sizes to its own body so the stack reads as a stack — no nested
// scrollbars until one layer runs genuinely long. Module-level so the identity
// stays stable across renders (the hook keys its resize on it).
const LAYER_SIZING = { collapsed: 320, expandedCap: () => 320 }

/** One read-only prompt layer, sized to its content. */
function TemplateLayer({ template }: { template: PromptTemplate }) {
  const bodyId = useId()
  const ref = useAutoGrowTextarea(template.body, false, LAYER_SIZING)

  return (
    <li>
      <label
        htmlFor={bodyId}
        className="mb-1.5 flex items-baseline gap-1.5 text-[10px] font-semibold tracking-wide text-ink-soft uppercase"
      >
        <span className="grid size-4 shrink-0 place-items-center rounded bg-chip text-[9px] text-chip-fg">
          {template.priority}
        </span>
        <span className="min-w-0 truncate">{template.label ?? 'Prompt template'}</span>
      </label>
      {/* Read-only rather than disabled: the text stays selectable, focusable,
          and reachable by keyboard, which is the whole point of showing it. */}
      <textarea
        id={bodyId}
        ref={ref}
        value={template.body}
        readOnly
        rows={1}
        spellCheck={false}
        className="w-full resize-none rounded-control border border-line bg-code px-3 py-2 text-xs leading-relaxed text-ink-strong"
      />
    </li>
  )
}

/**
 * Persona selection: which voice answers, and the stack of prompt templates
 * that frames each message sent under it. The composer's persona menu is the
 * fast switch; this panel is where the choice is explained and the prompt
 * layers in force are shown.
 *
 * UI only for now — the persona doesn't reach the responder yet, and the
 * templates are read-only here in any case.
 */
export function PersonaPanel({
  personas,
  personaId,
  onPersonaChange,
  templates,
}: PersonaPanelProps) {
  const { appName } = useBranding()
  const selectId = useId()
  const active = personas.find((p) => p.id === personaId) ?? personas[0]
  // Priority decides the order, not the order the host happened to pass them in.
  const ordered = [...templates].sort((a, b) => a.priority - b.priority)

  return (
    // Capped rather than fluid: in the widget's expanded layout the panel is
    // ~1200px wide, and a prompt template that long per line is unreadable.
    <div className="flex max-w-xl flex-col gap-4">
      <div>
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-[10px] font-semibold tracking-wide text-ink-soft uppercase"
        >
          Persona
        </label>
        {/* Native select: it keeps the OS picker (and its keyboard handling)
            inside the widget's shadow root, where a custom popup would have to
            re-solve outside-click and portalling. `colorScheme` on the widget
            root is what makes the native list follow the theme. */}
        <div className="relative">
          <select
            id={selectId}
            value={active?.id ?? ''}
            onChange={(e) => onPersonaChange(e.target.value)}
            className="w-full appearance-none rounded-control border border-line bg-tint/5 py-2 pr-8 pl-3 text-[13px] font-semibold text-ink-strong transition hover:bg-tint/8"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            width={14}
            height={14}
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-soft"
          />
        </div>
        {active && <p className="mt-1.5 text-xs text-ink-soft">{active.hint}</p>}
      </div>

      {ordered.length === 0 ? (
        <p className="py-2 text-xs text-ink-soft">
          No prompt template. {appName} answers on the persona alone.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {ordered.map((t) => (
            <TemplateLayer key={t.id} template={t} />
          ))}
        </ol>
      )}

      <p className="text-[11px] leading-relaxed text-ink-soft/80">
        The persona sets the voice; these layers set the standing instructions, applied in priority
        order. They're shown here for reference — edit them where they're defined.
      </p>
    </div>
  )
}
