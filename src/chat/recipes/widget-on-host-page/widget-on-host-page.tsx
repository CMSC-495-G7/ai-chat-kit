import { useEffect, useMemo, type CSSProperties } from 'react'
import { CUSTOM_THEME_CLASS, createPalette, type PaletteInput } from '../../../lib/palette'
import { ThemeToggle } from '../../../primitives/theme-toggle'
import type { Responder } from '../../engine/chatEngine'
import { init } from './widget/demoWidget'

// A fictional wealth firm embedding the chat widget. Both the page and the
// widget run on the `chat-theme-deep` palette from brand.css (a deep
// corporate navy), so this page doubles as proof that one class re-skins the
// library — including across the widget's shadow boundary, which the host
// page's own class can't reach.
const THEME = 'chat-theme-deep'

// The theme doesn't ship a display face, so the page supplies one itself. This
// is the documented escape hatch: any tier-1 variable can be redeclared on any
// element, and everything below it re-derives — no edit to brand.css needed.
const displayFace = {
  '--font-display-family': "Georgia, 'Times New Roman', serif",
} as CSSProperties

const services = [
  {
    title: 'Portfolio stewardship',
    body: 'Long-horizon allocations reviewed quarterly, rebalanced only when drift earns it.',
  },
  {
    title: 'Retirement design',
    body: 'Income floors, withdrawal sequencing, and the tax seams between accounts.',
  },
  {
    title: 'Next-generation planning',
    body: 'Trusts, gifting schedules, and the family conversations that make them stick.',
  },
]

const field =
  'rounded-control border border-line bg-panel px-3 py-2 text-sm font-normal tracking-normal text-ink-strong normal-case outline-none focus:border-accent'

export function WidgetDemoPage({
  responder,
  palette,
}: {
  responder?: Responder
  /** A custom palette for the page and the widget both, in place of THEME. */
  palette?: PaletteInput
}) {
  const paletteKey = palette ? JSON.stringify(palette) : ''

  // Mount the widget exactly the way an embedding site would — same init()
  // the script tag calls — and tear it down when the page unmounts.
  useEffect(() => {
    const custom = paletteKey ? (JSON.parse(paletteKey) as PaletteInput) : undefined
    const handle = custom
      ? init({ theme: 'auto', palette: custom, responder })
      : init({ theme: 'auto', themeClass: THEME, responder })
    return () => handle.destroy()
  }, [responder, paletteKey])

  // The page re-themes itself the same way, so host and widget agree.
  const pageStyle = useMemo(
    () => ({
      ...displayFace,
      ...(paletteKey && createPalette(JSON.parse(paletteKey) as PaletteInput)),
    }),
    [paletteKey],
  )

  return (
    <div
      className={`${paletteKey ? CUSTOM_THEME_CLASS : THEME} min-h-dvh bg-canvas text-ink-strong`}
      style={pageStyle}
    >
      <header className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
        <span className="font-(family-name:--font-display) text-xl font-bold tracking-tight">
          Alder&thinsp;&amp;&thinsp;Finch
        </span>
        <span className="hidden text-xs tracking-[0.2em] text-ink-soft uppercase sm:block">
          Private wealth counsel
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="border-y border-line py-16 sm:py-24">
          <p className="text-xs font-semibold tracking-[0.25em] text-brand-fg uppercase">
            Established 1987
          </p>
          <h1 className="mt-4 max-w-2xl font-(family-name:--font-display) text-4xl leading-tight sm:text-6xl">
            Quiet counsel for money that intends to outlast you.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink">
            We manage portfolios for two hundred families, most of whom found us the same way you
            did — through someone who never planned to leave. Questions? The assistant in the corner
            is our AI concierge, embedded with a single script tag.
          </p>
        </section>

        <section className="border-b border-line py-12">
          <h2 className="font-(family-name:--font-display) text-xl">Client portal</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink">
            The assistant reads these fields straight from this page. Edit them and watch the chat
            header and greeting update — no API, just the widget querying the host DOM.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 grid max-w-xl gap-4 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Account holder
              <input
                type="text"
                data-chat-profile="name"
                defaultValue="Joe"
                autoComplete="off"
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Login ID
              <input
                type="text"
                data-chat-profile="id"
                defaultValue="AB12345"
                pattern="[A-Za-z]{2}[0-9]{5}"
                autoComplete="off"
                className={field}
              />
            </label>
          </form>
        </section>

        <section className="grid gap-px bg-line sm:grid-cols-3">
          {services.map((s) => (
            <article key={s.title} className="bg-canvas py-8 pr-8">
              <h2 className="font-(family-name:--font-display) text-xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink">{s.body}</p>
            </article>
          ))}
        </section>

        <footer className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-line py-10 text-xs text-ink-soft">
          <span>Alder &amp; Finch is a fictional firm on a demo page.</span>
          <span>
            The chat bubble (bottom right) is the embedded chat widget — it keeps its own fonts and
            styles inside a shadow root, follows this page&apos;s light/dark theme, and is mounted
            with <code>themeClass: &apos;{THEME}&apos;</code> so it wears this brand too.
          </span>
        </footer>
      </main>
    </div>
  )
}
