import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

// The brand's colours, drawn from the tokens themselves. Every swatch is a
// `var(--token)`, so the toolbar's Mode, Palette and Highlight re-skin this
// page exactly as they re-skin a component.
const meta = {
  title: 'Brand/Colour',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-ink-strong">{title}</h2>
        {note && <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">{note}</p>}
      </div>
      {children}
    </section>
  )
}

function Swatch({ token, note, on }: { token: string; note?: string; on?: string }) {
  return (
    <div className="flex w-40 flex-col gap-1.5">
      <div
        className="grid h-16 place-items-center rounded-surface border border-line text-[13px] font-bold"
        style={{ background: `var(--${token})`, color: on ? `var(--${on})` : undefined }}
      >
        {on ? 'Aa' : null}
      </div>
      <code className="text-[11.5px] text-ink-strong">--{token}</code>
      {on && <code className="text-[11.5px] text-ink-soft">--{on}</code>}
      {note && <span className="text-[11.5px] leading-4 text-ink-soft">{note}</span>}
    </div>
  )
}

const row = 'flex flex-wrap gap-4'

export const Surfaces: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Section
        title="Surfaces"
        note="The page, the panels on it, and the lines between them. `--panel` is translucent: it is what the glass surfaces are made of."
      >
        <div className={row}>
          <Swatch token="canvas" note="The page" />
          <Swatch token="panel" note="Glass panels" />
          <Swatch token="panel-solid" note="Cards, menus, inputs" />
          <Swatch token="line" note="Borders and dividers" />
          <Swatch token="rail" note="The rail inside a turn" />
          <Swatch token="tint" note="Hover and selected washes" />
          <Swatch token="code" note="Inline code" />
          <Swatch token="code-block" note="Code blocks" />
        </div>
      </Section>
      <Section title="Ink" note="Three steps of text. Nothing else is used for body copy.">
        <div className="flex flex-col gap-2 rounded-surface border border-line bg-panel-solid p-5">
          <p className="text-[15px] font-bold text-ink-strong">
            --ink-strong · Headings and anything that must be read first
          </p>
          <p className="text-[15px] text-ink">--ink · Body text</p>
          <p className="text-[15px] text-ink-soft">--ink-soft · Labels, hints, secondary detail</p>
        </div>
      </Section>
    </div>
  ),
}

const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export const Ramps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Section
        title="Brand ramp"
        note="The identity hue. A palette declares these eleven steps and every semantic token derives from them. Components do not use the steps directly."
      >
        <div className="flex overflow-hidden rounded-surface border border-line">
          {BRAND_STEPS.map((step) => (
            <div key={step} className="flex min-w-0 flex-1 flex-col">
              <div className="h-16" style={{ background: `var(--brand-${step})` }} />
              <code className="px-1.5 py-1.5 text-[11px] text-ink-soft">{step}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section
        title="Warm ramp"
        note="Decoration only: the orb's two blooms. Never used for text, icons or state."
      >
        <div className={row}>
          <Swatch token="ember-300" />
          <Swatch token="ember-500" />
          <Swatch token="ember-600" />
        </div>
      </Section>
      <Section title="Danger ramp">
        <div className={row}>
          {[300, 400, 500, 600, 700].map((step) => (
            <Swatch key={step} token={`danger-${step}`} />
          ))}
        </div>
      </Section>
    </div>
  ),
}

export const Meaning: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Section
        title="Fills and what sits on them"
        note="Each fill is paired with the one colour allowed on top of it. The pairs are contrast-checked in both modes; several invert in dark."
      >
        <div className={row}>
          <Swatch token="brand-solid" on="on-brand-solid" note="Primary buttons, avatars" />
          <Swatch token="action" on="on-action" note="The composer's send button only" />
          <Swatch token="accent" on="on-accent" note="Selected, focused" />
          <Swatch token="chip" on="chip-fg" note="Soft fills: chips, icon tiles" />
          <Swatch token="bubble" on="on-bubble" note="The viewer's own message" />
          <Swatch token="notify" on="on-notify" note="A person is being waited on" />
          <Swatch token="danger-solid" on="on-danger-solid" note="Destructive actions" />
        </div>
      </Section>
      <Section
        title="Status"
        note="A surface, a line and a foreground for each. Caution is gold so it is never mistaken for the orange that means someone is being waited on."
      >
        <div className={row}>
          <Swatch token="caution-surface" on="caution" note="A caveat to weigh" />
          <Swatch token="success-surface" on="success-fg" note="Done, approved" />
          <Swatch token="pill-green-surface" on="pill-green-fg" />
          <Swatch token="pill-yellow-surface" on="pill-yellow-fg" />
          <Swatch token="pill-orange-surface" on="pill-orange-fg" />
          <Swatch token="pill-red-surface" on="pill-red-fg" />
        </div>
      </Section>
      <Section
        title="Text colours on the page"
        note="The brand and accent hues as text, stepped so they clear 4.5:1 on the canvas in each mode."
      >
        <div className="flex flex-col gap-2 rounded-surface border border-line bg-panel-solid p-5 text-[15px] font-semibold">
          <span className="text-brand-fg">--brand-fg · Brand as text</span>
          <span className="text-accent-fg">--accent-fg · Links</span>
          <span className="text-danger-fg">--danger-fg · An error</span>
          <span className="text-success-fg">--success-fg · A success</span>
          <span className="text-caution">--caution · A caveat</span>
        </div>
      </Section>
    </div>
  ),
}

const PALETTES = [
  { id: 'default', label: 'Navy (default)' },
  { id: 'classic', label: 'Classic' },
  { id: 'deep', label: 'Deep' },
  { id: 'graphite', label: 'Graphite' },
]

/** The same small composition under each palette class. Flip Mode on the
 *  toolbar to see where they part ways: light is close to identical by design,
 *  dark is where each has its own character. */
export const Palettes: Story = {
  render: () => (
    <Section
      title="The four palettes"
      note="Each cell carries one `chat-theme-*` class and nothing else. Flip Mode on the toolbar: light is near-identical across them by design, and dark is where they differ."
    >
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {PALETTES.map((palette) => (
          <div
            key={palette.id}
            className={`chat-theme-${palette.id} flex flex-col gap-3 rounded-surface border border-line bg-canvas p-5`}
          >
            <span className="text-[13px] font-bold text-ink-strong">{palette.label}</span>
            <div className="flex flex-col gap-3 rounded-surface border border-line bg-panel-solid p-4">
              <span className="text-[15px] font-bold text-ink-strong">A panel on the canvas</span>
              <span className="text-[13px] text-ink-soft">Secondary text, then the controls.</span>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-9 items-center rounded-control bg-brand-solid px-4 text-[13px] font-bold text-on-brand-solid">
                  Primary
                </span>
                <span className="inline-flex h-9 items-center rounded-control border border-line bg-panel-solid px-4 text-[13px] font-bold text-ink">
                  Secondary
                </span>
                <span className="inline-flex h-6 items-center rounded-control bg-chip px-2 text-[11.5px] font-bold text-chip-fg">
                  Chip
                </span>
                <span className="inline-flex h-6 items-center gap-1.5 rounded-control bg-notify px-2 text-[11.5px] font-bold text-on-notify">
                  Needs you
                </span>
                <span className="text-[13px] font-semibold text-accent-fg">A link</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  ),
}

const HIGHLIGHTS = ['orange', 'amber', 'yellow', 'blue', 'teal', 'violet']

export const Highlights: Story = {
  render: () => (
    <Section
      title="Highlight swatches"
      note="The wash behind a cited passage. Orange is the default; any element can pick another with a `chat-highlight-*` class. The strength of the wash is a token too, tuned per mode and per swatch."
    >
      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        {HIGHLIGHTS.map((swatch) => (
          <div
            key={swatch}
            className={`chat-highlight-${swatch} flex flex-col gap-2 rounded-surface border border-line bg-panel-solid p-4`}
          >
            <code className="text-[11.5px] text-ink-soft">chat-highlight-{swatch}</code>
            <p className="text-[13.5px] leading-6 text-ink">
              The borrower shall maintain{' '}
              <mark className="highlight-wash rounded-[3px] px-0.5 text-ink-strong">
                a debt service coverage ratio of at least 1.25
              </mark>{' '}
              at each test date.
            </p>
          </div>
        ))}
      </div>
    </Section>
  ),
}
