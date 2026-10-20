import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd } from './kbd'
const meta = { title: 'Primitives/Kbd', component: Kbd, tags: ['autodocs'] } satisfies Meta<
  typeof Kbd
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { children: '↵' } }

/** A key named in words, for platforms that do not draw it as a glyph. */
export const NamedKey: Story = { args: { children: 'Esc' } }

/** Two keys pressed together are two caps side by side, not one wide cap. */
export const Combination: Story = {
  render: () => (
    <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
      <Kbd>Ctrl</Kbd>
      <Kbd>Enter</Kbd>
      <span className="ml-1">send</span>
    </span>
  ),
}

/** Where it is used: the hint row under a list the keyboard can drive. */
export const HintRow: Story = {
  render: () => (
    <p className="flex items-center gap-3 text-[11px] text-ink-soft">
      <span>
        <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
      </span>
      <span>
        <Kbd>Tab</Kbd> accept
      </span>
      <span>
        <Kbd>Esc</Kbd> hide
      </span>
    </p>
  ),
}
