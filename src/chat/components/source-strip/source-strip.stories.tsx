import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { sources } from '../../fixtures/chat'
import type { Source } from '../../engine/types'
import { SourceStrip } from './source-strip'

const MANY: Source[] = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  title: `Working paper ${i + 1}`,
  markdown: '',
  fileType: i % 3 ? 'PDF' : 'XLSX',
}))

const meta = {
  title: 'Chat/Components/SourceStrip',
  component: SourceStrip,
  tags: ['autodocs'],
  args: { sources, onCite: fn() },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  parameters: {
    docs: {
      description: { component: 'The compact row of numbered source pills under an answer.' },
    },
  },
} satisfies Meta<typeof SourceStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Many: Story = { args: { sources: MANY } }

/** A single source still gets its numbered pill. */
export const Single: Story = { args: { sources: sources.slice(0, 1) } }

/** A long title is cut inside its pill so the row keeps one height. */
export const LongTitles: Story = {
  args: {
    sources: [
      {
        id: 1,
        title: 'Liquidity policy for operating accounts, revised and approved by the board',
        markdown: '',
        fileType: 'PDF',
      },
      {
        id: 2,
        title: 'Thirteen-week cash forecast including the quarterly tax payment schedule',
        markdown: '',
        fileType: 'XLSX',
      },
    ],
  },
}
