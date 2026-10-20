import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  RAMP_STEPS,
  checkPalette,
  createPalette,
  usePalette,
  type PaletteInput,
} from '../src/lib/palette'
import { Button } from '../src/primitives/button'
import { Orb } from '../src/primitives/orb'
import { Pill } from '../src/primitives/pill'
import { ChatMessage } from '../src/chat/components/chat-message/chat-message'
import { Composer } from '../src/chat/components/composer/composer'
import { messages } from '../src/chat/fixtures/chat'

// A palette built at runtime from seed colours (src/lib/palette). The story
// applies it to <html> the way an app would, so the toolbar's Mode still
// flips light and dark — and every swatch, control and portal below follows.
// The toolbar's Palette has no effect while it is applied: inline variables
// win over a theme class.

type Args = {
  brand: string
  accent: string
  warm: string
  surfaces: 'tinted' | 'neutral'
  anchor: 'auto' | '600'
}

const isHex = (v: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())

function toInput({ brand, accent, warm, surfaces, anchor }: Args): PaletteInput {
  return {
    brand: isHex(brand) ? brand : '#004c97',
    accent: accent && isHex(accent) ? accent : undefined,
    warm: warm && isHex(warm) ? warm : undefined,
    surfaces,
    anchor: anchor === 'auto' ? 'auto' : 600,
  }
}

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

function Ramp({ name, steps }: { name: string; steps: readonly number[] }) {
  return (
    <div className="flex flex-col gap-1">
      <code className="text-[11.5px] text-ink-soft">--{name}-*</code>
      <div className="flex overflow-hidden rounded-control border border-line">
        {steps.map((s) => (
          <div
            key={s}
            title={`--${name}-${s}`}
            className="grid h-12 w-14 place-items-end p-1 text-[10px] font-semibold"
            style={{ background: `var(--${name}-${s})`, color: s < 500 ? '#1c2733' : '#ffffff' }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomPalette(args: Args) {
  const input = toInput(args)
  usePalette(input)
  const checks = checkPalette(input)
  const vars = createPalette(input)

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Ramps"
        note="Built from the seed colours with the default theme's lightness table, so the contrast ratios land where the shipped themes' do."
      >
        <Ramp name="brand" steps={RAMP_STEPS} />
        <Ramp name="accent" steps={[200, 300, 400, 500, 600, 700]} />
        <Ramp name="ember" steps={[300, 500, 600]} />
      </Section>

      <Section title="In use" note="Real components on the palette. Flip Mode in the toolbar.">
        <div className="flex flex-wrap items-center gap-3">
          <Orb className="block size-10" />
          <Button variant="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Pill tone="brand">Brand pill</Pill>
          <a href="#palette" className="text-sm font-semibold text-brand-fg underline">
            A link
          </a>
        </div>
        <div className="flex max-w-2xl flex-col gap-4 rounded-surface border border-line bg-panel p-4">
          <ChatMessage message={messages.question} />
          <ChatMessage message={messages.answer} />
          <Composer docked onSubmit={() => {}} />
        </div>
      </Section>

      <Section
        title="Contrast"
        note="checkPalette measures the pairs brand.css leans on hardest. Run it on any palette a tenant supplies."
      >
        <table className="max-w-2xl text-left text-[13px]">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-1 pr-4 font-semibold">Pair</th>
              <th className="py-1 pr-4 font-semibold">Mode</th>
              <th className="py-1 pr-4 font-semibold">Ratio</th>
              <th className="py-1 font-semibold">Needs</th>
            </tr>
          </thead>
          <tbody className="text-ink">
            {checks.map((c) => (
              <tr key={`${c.mode}-${c.pair}`} className="border-t border-line">
                <td className="py-1 pr-4">{c.pair}</td>
                <td className="py-1 pr-4">{c.mode}</td>
                <td className={`py-1 pr-4 font-semibold ${c.ok ? '' : 'text-danger-fg'}`}>
                  {c.ratio.toFixed(2)}:1 {c.ok ? '' : '(fails)'}
                </td>
                <td className="py-1">{c.min}:1</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="The variables" note="What createPalette returns, ready for a stylesheet.">
        <pre className="max-h-80 max-w-2xl overflow-auto rounded-control bg-code-block p-3 text-[12px] text-ink">
          {Object.entries(vars)
            .map(([k, v]) => `${k}: ${v};`)
            .join('\n')}
        </pre>
      </Section>
    </div>
  )
}

const meta = {
  title: 'Brand/Custom palette',
  component: CustomPalette,
  parameters: { layout: 'padded' },
  args: { brand: '#004c97', accent: '', warm: '', surfaces: 'tinted', anchor: 'auto' },
  argTypes: {
    brand: { control: 'color', description: 'The identity colour' },
    accent: { control: 'color', description: 'The action hue. Empty uses brand.' },
    warm: {
      control: 'color',
      description: 'The warm note (page glow, dark send button). Empty keeps the shipped orange.',
    },
    surfaces: { control: 'inline-radio', options: ['tinted', 'neutral'] },
    anchor: { control: 'inline-radio', options: ['auto', '600'] },
  },
} satisfies Meta<typeof CustomPalette>

export default meta
type Story = StoryObj<typeof meta>

/** The default theme's blue as the only seed: the ramps come back within a
 *  step or two of the hand-tuned ones. */
export const Playground: Story = {}

export const Teal: Story = { args: { brand: '#0f766e' } }

/** One hue everywhere: the warm note is the brand colour too, so there is no
 *  orange anywhere — not in the page glow, not on the dark send button. */
export const SingleHuePlum: Story = { args: { brand: '#7c3aed', warm: '#7c3aed' } }

export const NeutralDark: Story = { args: { brand: '#be123c', surfaces: 'neutral' } }
