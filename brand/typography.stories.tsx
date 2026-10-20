import type { Meta, StoryObj } from '@storybook/react-vite'

// The type the library is set in. The sizes and weights listed are the ones
// the components actually use, counted from the source, not an aspirational scale.
const meta = {
  title: 'Brand/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const WEIGHTS = [
  { value: 400, label: 'Regular', className: 'font-normal', use: 'Body text' },
  { value: 500, label: 'Medium', className: 'font-medium', use: 'Quiet labels, unselected items' },
  { value: 600, label: 'Semibold', className: 'font-semibold', use: 'Names, links, most labels' },
  { value: 700, label: 'Bold', className: 'font-bold', use: 'Buttons, titles, selected items' },
]

export const Family: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <span className="text-[13px] text-ink-soft">--font-brand</span>
        <p className="text-5xl font-bold tracking-tight text-ink-strong">Nunito Sans</p>
        <p className="max-w-2xl text-[15px] leading-6 text-ink">
          One family for everything. A palette may name a different face through{' '}
          <code className="text-[13px]">--font-brand-family</code>, and a display face for large
          headings through <code className="text-[13px]">--font-display-family</code>. Monospace is
          the system's, used for code, ids and timings.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-ink-strong">Weights</h2>
        <div className="flex flex-col divide-y divide-line rounded-surface border border-line bg-panel-solid">
          {WEIGHTS.map((weight) => (
            <div key={weight.value} className="flex items-baseline gap-6 px-5 py-3.5">
              <span className="w-28 shrink-0 text-[13px] text-ink-soft tabular-nums">
                {weight.value} {weight.label}
              </span>
              <span className={`min-w-0 flex-1 text-xl text-ink-strong ${weight.className}`}>
                Waiting on your approval
              </span>
              <span className="w-64 shrink-0 text-[13px] text-ink-soft max-md:hidden">
                {weight.use}
              </span>
            </div>
          ))}
        </div>
        <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">
          The font is loaded from 300 to 700. Components also ask for 800 (
          <code>font-extrabold</code>) in places; with no 800 face loaded, the browser draws those
          at 700.
        </p>
      </section>
    </div>
  ),
}

const SIZES = [
  { px: 32, className: 'text-[32px] font-bold tracking-tight', use: 'A page greeting' },
  { px: 24, className: 'text-2xl font-bold tracking-tight', use: 'A page title' },
  { px: 19, className: 'text-[19px] font-bold tracking-tight', use: 'A panel title' },
  { px: 16, className: 'text-base font-bold', use: 'A dialog or section title' },
  { px: 15, className: 'text-[15px]', use: 'Reading text: an answer, a description' },
  { px: 14, className: 'text-sm', use: 'Inputs, list rows' },
  { px: 13, className: 'text-[13px]', use: 'The default control size: buttons, labels, menus' },
  { px: 12, className: 'text-xs', use: 'Secondary lines under a name' },
  { px: 11, className: 'text-[11px] font-bold tracking-[0.14em] uppercase', use: 'Section labels' },
]

export const Sizes: Story = {
  render: () => (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-ink-strong">Sizes in use</h2>
      <p className="max-w-3xl text-[13px] leading-5 text-ink-soft">
        13px is the size the interface is built around, with 11 to 12.5px for supporting detail.
        Larger sizes are rare and reserved for titles.
      </p>
      <div className="flex flex-col divide-y divide-line rounded-surface border border-line bg-panel-solid">
        {SIZES.map((size) => (
          <div key={size.px} className="flex items-baseline gap-6 px-5 py-3">
            <span className="w-14 shrink-0 text-[13px] text-ink-soft tabular-nums">
              {size.px}px
            </span>
            <span className={`min-w-0 flex-1 truncate text-ink-strong ${size.className}`}>
              Commercial loan review
            </span>
            <span className="w-80 shrink-0 text-[13px] text-ink-soft max-md:hidden">
              {size.use}
            </span>
          </div>
        ))}
      </div>
    </section>
  ),
}
