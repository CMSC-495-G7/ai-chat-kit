import type { Meta, StoryObj } from '@storybook/react-vite'

// Corners, elevation, the two signature surfaces and the three animations.
// All of it is in brand/tokens.css.
const meta = {
  title: 'Brand/Shape and motion',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const RADII = [
  { name: 'rounded-check', value: '4px', use: 'Checkboxes, small marks' },
  { name: 'rounded-control', value: '7px', use: 'Buttons, inputs, chips, menu items' },
  { name: 'rounded-surface', value: '10px', use: 'Cards, panels, tables' },
  { name: 'rounded-dialog', value: '14px', use: 'Dialogs' },
  {
    name: 'rounded-full',
    value: 'circle',
    use: 'Avatars, radios, switches, dots, circular icon buttons',
  },
]

export const Corners: Story = {
  render: () => (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-ink-strong">Corner radii</h2>
      <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">
        Four steps, named for what they are used on. `rounded-full` is kept for geometry that has to
        stay circular.
      </p>
      <div className="flex flex-wrap gap-5">
        {RADII.map((radius) => (
          <div key={radius.name} className="flex w-44 flex-col gap-2">
            <div className={`h-20 border-2 border-brand-fg bg-chip ${radius.name}`} />
            <code className="text-[11.5px] text-ink-strong">{radius.name}</code>
            <span className="text-[11.5px] text-ink-soft">
              {radius.value} · {radius.use}
            </span>
          </div>
        ))}
      </div>
    </section>
  ),
}

const SHADOWS = [
  {
    token: 'shadow-soft',
    className: 'shadow-sm shadow-(color:--shadow-soft)',
    use: 'Cards at rest',
  },
  {
    token: 'shadow-raised',
    className: 'shadow-md shadow-(color:--shadow-raised)',
    use: 'A card on hover',
  },
  {
    token: 'shadow-menu',
    className: 'shadow-xl shadow-(color:--shadow-menu)',
    use: 'Menus and pop-ups',
  },
  { token: 'shadow-deep', className: 'shadow-2xl shadow-(color:--shadow-deep)', use: 'Dialogs' },
]

export const Elevation: Story = {
  render: () => (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-ink-strong">Elevation</h2>
      <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">
        Shadows are tinted with the brand hue rather than black, so a raised surface reads as part
        of the palette. The colour is a token; the size is Tailwind's.
      </p>
      <div className="flex flex-wrap gap-8 p-4">
        {SHADOWS.map((shadow) => (
          <div key={shadow.token} className="flex w-44 flex-col gap-3">
            <div
              className={`h-20 rounded-surface border border-line bg-panel-solid ${shadow.className}`}
            />
            <code className="text-[11.5px] text-ink-strong">--{shadow.token}</code>
            <span className="text-[11.5px] text-ink-soft">{shadow.use}</span>
          </div>
        ))}
      </div>
    </section>
  ),
}

export const Surfaces: Story = {
  render: () => (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-ink-strong">Glass and the mark</h2>
      <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">
        `.glass` is a translucent panel that blurs what is behind it; it sits over the ambient glow
        that washes in from two corners of a page. `.orb` is the logo mark: a white face on a
        rounded tile of the brand colour, so it re-colours with the palette.
      </p>
      <div
        className="relative flex min-h-72 items-center gap-8 overflow-hidden rounded-surface border border-line bg-canvas p-8"
        style={{
          backgroundImage: `radial-gradient(40rem 26rem at 85% -10%, var(--canvas-glow-a), transparent 60%),
            radial-gradient(34rem 22rem at -10% 110%, var(--canvas-glow-b), transparent 60%)`,
        }}
      >
        <div className="glass flex w-72 flex-col gap-2 rounded-surface p-5">
          <span className="text-[15px] font-bold text-ink-strong">A glass panel</span>
          <span className="text-[13px] leading-5 text-ink-soft">
            The chat menu and the conversation card are made of this.
          </span>
        </div>
        <div className="flex items-end gap-5">
          {[20, 30, 44, 64].map((size) => (
            <span
              key={size}
              className="orb block shrink-0"
              style={{ width: size, height: size }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  ),
}

export const Motion: Story = {
  render: () => (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-ink-strong">Motion</h2>
      <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">
        Five animations, shared by every palette. With reduced motion switched on in the operating
        system, all of them collapse to nothing and the face rests.
      </p>
      <div className="grid grid-cols-5 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
        <div className="flex flex-col items-start gap-3 rounded-surface border border-line bg-panel-solid p-5">
          <span className="orb block size-11 animate-orb-drift" aria-hidden />
          <code className="text-[11.5px] text-ink-strong">animate-orb-drift</code>
          <span className="text-[11.5px] text-ink-soft">The mark, while the page is idle</span>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-surface border border-line bg-panel-solid p-5">
          <span className="orb block size-11 animate-orb-think" aria-hidden />
          <code className="text-[11.5px] text-ink-strong">animate-orb-think</code>
          <span className="text-[11.5px] text-ink-soft">Drifts and blinks while it reasons</span>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-surface border border-line bg-panel-solid p-5">
          <span className="orb block size-11 animate-orb-talk" aria-hidden />
          <code className="text-[11.5px] text-ink-strong">animate-orb-talk</code>
          <span className="text-[11.5px] text-ink-soft">Talks while the answer streams</span>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-surface border border-line bg-panel-solid p-5">
          <span className="animate-fade-up rounded-control bg-chip px-3 py-2 text-[13px] font-bold text-chip-fg">
            A new message
          </span>
          <code className="text-[11.5px] text-ink-strong">animate-fade-up</code>
          <span className="text-[11.5px] text-ink-soft">Anything arriving on the page</span>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-surface border border-line bg-panel-solid p-5">
          <span className="shimmer-text py-2 text-[13px] font-semibold">Thinking it through…</span>
          <code className="text-[11.5px] text-ink-strong">shimmer-text</code>
          <span className="text-[11.5px] text-ink-soft">Work in progress, in words</span>
        </div>
      </div>
    </section>
  ),
}
