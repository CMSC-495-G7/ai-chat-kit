import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, SparkleIcon } from '../../../primitives/icons'
import type { PersonaMenuProps } from './types'

/** Persona picker: a trigger (labelled pill, or icon-only when compact) and a
 *  pop-up listbox. Closes on outside click. */
export function PersonaMenu({ personas, persona, onChange, compact }: PersonaMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activePersona = personas.find((p) => p.id === persona) ?? personas[0]

  // Close on outside click. composedPath() (not contains()) because inside the
  // widget's shadow root, events reaching the document are retargeted to the
  // shadow host and contains() would always fail.
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !e.composedPath().includes(menuRef.current)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Persona: ${activePersona.name}`}
          title={`Persona: ${activePersona.name}`}
          className="flex items-center justify-center rounded-full bg-chip p-1.5 text-chip-fg transition hover:bg-chip-hover"
        >
          <SparkleIcon width={16} height={16} className="text-accent" />
        </button>
      ) : (
        <>
          {/* Below the ancestor `@container/composer`'s `@sm` breakpoint (see
              Composer) there isn't room for the labelled pill — the row
              squishes instead of shrinking gracefully. This trigger and the
              labelled one below share the same open state; only one is ever
              visible, toggled purely by CSS so no width measurement/JS is
              needed. */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Persona: ${activePersona.name}`}
            title={`Persona: ${activePersona.name}`}
            className="flex items-center justify-center rounded-full bg-chip p-2 text-chip-fg transition hover:bg-chip-hover @sm/composer:hidden"
          >
            {/* No ChevronUpIcon in the set — a "drop-up" menu, so the
                down-chevron rotated to point up reads the same as one. */}
            <ChevronDownIcon width={14} height={14} className="rotate-180 text-accent" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="hidden items-center gap-1.5 rounded-control bg-chip px-3.5 py-2 text-[13px] font-semibold text-chip-fg transition hover:bg-chip-hover @sm/composer:flex"
          >
            <SparkleIcon width={14} height={14} className="text-accent" />
            {activePersona.name}
            <ChevronDownIcon
              width={14}
              height={14}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </>
      )}

      {open && (
        <ul
          role="listbox"
          aria-label="Chat persona"
          className="absolute bottom-full left-0 z-20 mb-2 w-56 overflow-hidden rounded-control border border-line bg-panel-solid p-1.5 shadow-xl shadow-(color:--shadow-menu)"
        >
          {personas.map((p) => (
            <li key={p.id} role="option" aria-selected={p.id === persona}>
              <button
                type="button"
                onClick={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left transition hover:bg-tint/8"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-ink-strong">{p.name}</span>
                  <span className="block text-xs text-ink-soft">{p.hint}</span>
                </span>
                {p.id === persona && <CheckIcon width={15} height={15} className="text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
