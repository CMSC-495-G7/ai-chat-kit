import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { highlights, sources } from '../../fixtures/chat'
import { citationPreview } from '../../engine/highlights'
import { CitationChip } from './citation-chip'
import { CitationPreviewCard } from './citation-preview'

const preview = (id: number) => {
  const source = sources.find((s) => s.id === id)
  return source ? citationPreview(source, highlights) : null
}

const meta = {
  title: 'Chat/Components/CitationChip',
  component: CitationChip,
  tags: ['autodocs'],
  args: { n: 1, onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'An inline `[n]` marker. The superscript is a translate, not `<sup>`, so line height stays put. Given `preview`, hover or focus raises the passage it cites — checking a citation doesn’t cost your place in the answer.',
      },
    },
  },
} satisfies Meta<typeof CitationChip>

export default meta
type Story = StoryObj<typeof meta>

export const Chip: Story = {}

/** Hover or tab to a chip. Source 2 has a highlight; open it for the passage. */
export const InProseWithPreview: Story = {
  render: (args) => (
    <p className="max-w-xl pt-40 text-[14.5px] leading-relaxed text-ink">
      The policy requires 30 days of cover <CitationChip {...args} n={1} preview={preview} />, and
      the Q2 report puts available balance at $4.82M{' '}
      <CitationChip {...args} n={2} preview={preview} /> — above the floor. Large wires need two
      approvers <CitationChip {...args} n={3} preview={preview} />.
    </p>
  ),
}

/** The card on its own, as the preview renders it. */
export const PreviewCard: Story = {
  render: () => (
    <div className="w-80 rounded-surface border border-line bg-panel-solid shadow-lg">
      <CitationPreviewCard preview={preview(1)!} onOpenReference={fn()} />
    </div>
  ),
}
