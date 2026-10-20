import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionLabel } from './section-label'

const meta = {
  title: 'Primitives/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
  args: { children: 'Details' },
} satisfies Meta<typeof SectionLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** For a block that is a caveat rather than plain information. */
export const Caution: Story = { args: { tone: 'caution', children: 'Policy exception' } }

/** Where it is used: naming the blocks stacked in a side panel. */
export const InAPanel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-5 rounded-surface border border-line bg-panel-solid p-5">
      <div className="flex flex-col gap-2">
        <SectionLabel>Details</SectionLabel>
        <p className="text-[13px] leading-5 text-ink">Assigned to Dana Whitfield, due in 3h 40m.</p>
      </div>
      <div className="flex flex-col gap-2">
        <SectionLabel tone="caution">Policy exception</SectionLabel>
        <p className="text-[13px] leading-5 text-ink">Leverage is above the 4.0x guideline.</p>
      </div>
    </div>
  ),
}
