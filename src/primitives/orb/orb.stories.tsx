import type { Meta, StoryObj } from '@storybook/react-vite'
import { Orb } from './orb'
const meta = { title: 'Primitives/Orb', component: Orb, tags: ['autodocs'] } satisfies Meta<
  typeof Orb
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { className: 'block size-16 animate-orb-drift' } }

/** The caller sets the size. These are the ones the library draws it at. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-5">
      {['size-5', 'size-6', 'size-7', 'size-[30px]', 'size-10', 'size-16'].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Orb className={`block ${size}`} />
          <code className="text-[11px] text-ink-soft">{size}</code>
        </div>
      ))}
    </div>
  ),
}

/** Still, as it sits beside a product name in a bar. Motion is for an idle page. */
export const BesideAName: Story = {
  render: () => (
    <div className="flex items-center gap-2.5">
      <Orb className="block size-6" />
      <span className="text-[17px] font-bold tracking-tight text-ink-strong">Assistant</span>
    </div>
  ),
}

/** Faded, as the mark in an empty panel: present, but not asking for attention. */
export const Muted: Story = { args: { className: 'block size-8 opacity-40' } }
