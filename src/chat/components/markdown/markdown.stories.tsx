import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { answerMarkdown, highlights, mermaidSource, sources } from '../../fixtures/chat'
import { Markdown } from './markdown'

const GFM = `### Everything GFM

A paragraph with **bold**, _emphasis_, \`inline code\` and a [link](https://example.com).

- Bullets
  - nest
- [x] and tasks
- [ ] carry state

> A quotation, for the policy language that must be quoted rather than paraphrased.

\`\`\`json
{ "available": 4820000, "currency": "USD" }
\`\`\`

| Account | Balance |
| :--- | ---: |
| Operating | $3.10M |
| Payroll | $1.72M |

A marker with no matching source passes through untouched: [sic].`

const meta = {
  title: 'Chat/Components/Markdown',
  component: Markdown,
  tags: ['autodocs'],
  args: { text: GFM, streaming: false },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'The GFM renderer. `[n]` markers become `CitationChip`s only when `n` matches a real source id, so `[sic]` survives; a half-received trailing `[12` is hidden mid-stream so it never flickers as text. ` ```mermaid ` fences render as diagrams.',
      },
    },
  },
} satisfies Meta<typeof Markdown>

export default meta
type Story = StoryObj<typeof meta>

export const Gfm: Story = { name: 'GFM' }

export const WithCitations: Story = {
  args: { text: answerMarkdown, sources, highlights, onCite: fn() },
}

/** The trailing `[1` is held back until the marker closes. */
export const StreamingPartialMarker: Story = {
  args: {
    text: 'The liquidity policy requires 30 days of forecast outflows [1',
    streaming: true,
    sources,
  },
}

/** Replays the answer token by token, the way a responder delivers it. */
export const StreamingReplay: Story = {
  render: function ReplayStory() {
    const words = answerMarkdown.split(/(?<=\s)/)
    const [n, setN] = useState(0)
    const done = n >= words.length
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="self-start rounded-control border border-line px-3 py-1 text-[12px] text-ink"
          onClick={() => {
            setN(0)
            const id = setInterval(
              () =>
                setN((i) => {
                  if (i + 1 >= words.length) clearInterval(id)
                  return i + 1
                }),
              35,
            )
          }}
        >
          {n === 0 || done ? 'Play stream' : 'Streaming…'}
        </button>
        <Markdown text={words.slice(0, n).join('')} streaming={!done} sources={sources} />
      </div>
    )
  },
}

export const Mermaid: Story = {
  args: { text: `Here is the approval flow:\n\n\`\`\`mermaid\n${mermaidSource}\n\`\`\`` },
}
