import type { Meta, StoryObj } from '@storybook/react-vite'
import { mermaidSource } from '../../chat/fixtures/chat'
import { MermaidBlock } from './mermaid-block'

const SEQUENCE = `sequenceDiagram
  participant I as Initiator
  participant A as Approver
  participant B as Bank
  I->>A: Submit wire
  A->>A: Check beneficiary
  A->>B: Release
  B-->>I: Confirmation`

const meta = {
  title: 'Components/MermaidBlock',
  component: MermaidBlock,
  tags: ['autodocs'],
  args: { code: mermaidSource, streaming: false },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'A ` ```mermaid ` fence as a diagram. The renderer (`beautiful-mermaid`) is lazily imported, so it costs nothing until a diagram appears — this story is the first thing in Storybook that fetches it. While `streaming`, only complete lines are drawn and the last good diagram stays up.',
      },
    },
  },
} satisfies Meta<typeof MermaidBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Flowchart: Story = {}

export const Sequence: Story = { args: { code: SEQUENCE } }

/** The fence is still open and the last line is half-written. */
export const Streaming: Story = {
  args: {
    code: mermaidSource.split('\n').slice(0, 4).join('\n') + '\n  D --> E[Second appro',
    streaming: true,
  },
}

/** Reported as an error only once the fence has closed. */
export const Invalid: Story = { args: { code: 'flowchart LR\n  A -->> B -- ??' } }
