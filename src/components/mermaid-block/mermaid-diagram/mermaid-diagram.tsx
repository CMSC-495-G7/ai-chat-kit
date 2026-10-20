import { withDefaults } from '../../../lib/withDefaults'
import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { renderMermaidSVG } from 'beautiful-mermaid'
import { CopyButton } from '../../../primitives/copy-button'
import { useUiSize } from '../../../lib/uiSize'
import { DrawingBox, MermaidFrame, MermaidPending } from '../frame'
import { completeLines, describeDiagram, hasBody } from '../source'
import type { MermaidBlockProps } from '../types'

/**
 * Colours go in as `var(--token)` and stay that way on the <svg>, so a palette
 * or light/dark switch recolours a drawn diagram with no re-render. Inside the
 * widget's shadow root the tokens resolve against the widget's own root, so
 * its palette applies too.
 */
const OPTIONS = {
  bg: 'var(--code-block)',
  fg: 'var(--ink-strong)',
  line: 'var(--ink-soft)',
  accent: 'var(--accent)',
  muted: 'var(--ink-soft)',
  surface: 'var(--panel-solid)',
  border: 'var(--line)',
  font: 'var(--font-brand)',
  transparent: true,
  padding: 16,
}

/**
 * Model output decides what goes into this SVG, and a retrieved document can
 * steer the model — so the markup is untrusted even though the renderer
 * escapes label text. Checked against beautiful-mermaid 1.1.3: labels and
 * attribute break-outs are escaped, but a `style` statement passes
 * `javascript:` into a fill url(). Browsers don't run that, and it is still
 * the kind of gap one version bump could widen.
 *
 * DOMPurify's SVG profile drops scripts, handlers and foreign content, and
 * vets URL attributes (href, xlink:href) — but not presentation attributes
 * like `fill`, which is where that url() lands. The hook covers those. A
 * private instance, so the hook never reaches anything else on the page that
 * uses DOMPurify (official mermaid bundles it). About a millisecond per
 * finished line.
 */
const purify = DOMPurify(window)
purify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (/javascript:/i.test(data.attrValue.replace(/\s+/g, ''))) data.keepAttr = false
})

/**
 * How often a streaming diagram's preview moves on. Deliberately slower than
 * the stream: each step is a crossfade the eye can follow rather than a
 * flicker, and elkjs's layout — the expensive part, on the main thread — runs
 * once per step instead of once per line.
 */
const PREVIEW_EVERY_MS = 1500

/** `value`, changing at most once every `ms` — always ending on the latest. */
function usePaced<T>(value: T, ms: number, enabled: boolean): T {
  const [paced, setPaced] = useState(value)
  const last = useRef(0)
  useEffect(() => {
    if (!enabled) return
    const t = setTimeout(
      () => {
        last.current = Date.now()
        setPaced(value)
      },
      Math.max(0, last.current + ms - Date.now()),
    )
    return () => clearTimeout(t)
  }, [value, ms, enabled])
  return enabled ? paced : value
}

function draw(source: string): string | null {
  try {
    return purify.sanitize(renderMermaidSVG(source, OPTIONS), {
      USE_PROFILES: { svg: true, svgFilters: true },
    })
  } catch {
    return null
  }
}

/** Loaded on demand by MermaidBlock — this module carries the renderer. */
export default function MermaidDiagram({
  code,
  streaming,
  label: customLabel,
  labels: overrides,
  previewIntervalMs = PREVIEW_EVERY_MS,
}: MermaidBlockProps) {
  const { label: inferredLabel, drawable } = describeDiagram(code)
  const label = customLabel ?? inferredLabel
  const labels = withDefaults(
    {
      drawing: 'Drawing diagram…',
      copy: 'Copy diagram source',
      copied: 'Copied',
      showDiagram: 'Show diagram',
      showSource: 'Show diagram source',
      diagram: 'Diagram',
      source: 'Source',
      error: 'This diagram has an error, so here is its source.',
      unsupported: (label: string) =>
        `This ${label.toLowerCase()} can’t be drawn here yet, so here is its source.`,
    },
    overrides,
  )
  const compact = useUiSize() === 'compact'
  const [showSource, setShowSource] = useState(false)

  // Mid-stream, only finished lines, and only as often as the preview moves.
  // Once the fence closes the whole source draws at once, unpaced.
  const source = usePaced(streaming ? completeLines(code) : code, previewIntervalMs, !!streaming)
  const svg = useMemo(() => (drawable && hasBody(source) ? draw(source) : null), [source, drawable])

  // The last diagram that drew. Mid-stream, a finished line can still leave the
  // source invalid for a moment — an edge to a node declared further down —
  // and holding the previous frame reads far better than flashing an error.
  // Set during render (React's derived-state pattern), not in an effect, so
  // the held frame never lags a render behind.
  const [held, setHeld] = useState<string | null>(null)
  if (svg && svg !== held) setHeld(svg)

  if (streaming) {
    const shown = svg ?? held
    if (!shown) return <MermaidPending label={label} message={labels.drawing} />
    return (
      <MermaidFrame label={label} busy>
        <DrawingBox message={labels.drawing}>
          <Preview svg={shown} />
        </DrawingBox>
      </MermaidFrame>
    )
  }

  const copy = (
    <CopyButton
      text={code}
      label={labels.copy}
      copiedLabel={labels.copied}
      size="sm"
      iconSize={14}
    />
  )

  // Finished but not drawable — an unsupported type, or a real error. Either
  // way the reader gets the source and one plain sentence, never the parser's
  // message: beautiful-mermaid's names only flowcharts, whatever the type.
  if (!svg) {
    return (
      <MermaidFrame label={label} actions={copy}>
        <p className="border-b border-line px-3.5 py-2 text-xs text-ink-soft">
          {drawable ? labels.error : labels.unsupported(label)}
        </p>
        <Source code={code} compact={compact} />
      </MermaidFrame>
    )
  }

  return (
    <MermaidFrame
      label={label}
      actions={
        <>
          <button
            type="button"
            onClick={() => setShowSource((s) => !s)}
            aria-label={showSource ? labels.showDiagram : labels.showSource}
            className="rounded-control px-2 py-1 text-[11px] font-semibold tracking-wide text-ink-soft uppercase transition hover:bg-tint/8 hover:text-ink-strong"
          >
            {showSource ? labels.diagram : labels.source}
          </button>
          {copy}
        </>
      }
    >
      {showSource ? <Source code={code} compact={compact} /> : <Drawing svg={svg} label={label} />}
    </MermaidFrame>
  )
}

/**
 * The finished diagram, at its natural size. It fades in over the box it
 * replaces — opacity only, nothing that moves — and the global reduced-motion
 * rule makes even that instant.
 */
function Drawing({ svg, label }: { svg: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="overflow-x-auto p-4 transition-opacity duration-500 starting:opacity-0 [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/**
 * The work so far, blurred and dimmed inside the fixed DrawingBox: enough to
 * see the shape growing, not enough to read into a half-drawn diagram. Each
 * snapshot is scaled to fit the box, so a growing diagram never changes the
 * box's size, and crossfades in over the last one — the outgoing snapshot
 * fades out as the incoming one fades in, so the two never show at once.
 *
 * With reduced motion the preview is left out entirely: the static
 * placeholder, then the finished diagram.
 *
 * `will-change` gives each layer its own compositing layer, so fading it only
 * changes that layer's opacity; without it WebKit re-rasterizes the blur on
 * every frame of the crossfade.
 */
function Preview({ svg }: { svg: string }) {
  // The last two snapshots, keyed, so the outgoing one can fade out.
  const [frames, setFrames] = useState<{ id: number; svg: string }[]>([])
  const newest = frames[frames.length - 1]
  if (svg !== newest?.svg) setFrames([...frames.slice(-1), { id: (newest?.id ?? 0) + 1, svg }])

  return frames.map((frame) => (
    <div
      key={frame.id}
      aria-hidden
      className={`absolute inset-0 flex items-center justify-center p-5 blur-[5px] transition-opacity duration-700 will-change-[opacity] starting:opacity-0 motion-reduce:hidden [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:max-w-full ${
        frame === frames[frames.length - 1] ? 'opacity-45' : 'opacity-0'
      }`}
      dangerouslySetInnerHTML={{ __html: frame.svg }}
    />
  ))
}

function Source({ code, compact }: { code: string; compact: boolean }) {
  return (
    <pre
      className={`overflow-x-auto p-3.5 font-mono leading-relaxed text-ink-strong ${compact ? 'text-xs' : 'text-[13px]'}`}
    >
      <code>{code}</code>
    </pre>
  )
}
