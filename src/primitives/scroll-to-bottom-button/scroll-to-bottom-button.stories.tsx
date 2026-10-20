import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useStickToBottom } from '../../hooks/useStickToBottom'
import { ScrollToBottomButton } from './scroll-to-bottom-button'

const meta = {
  title: 'Primitives/ScrollToBottomButton',
  component: ScrollToBottomButton,
  tags: ['autodocs'],
  args: { visible: true, onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'The “New messages” pill shown once the reader scrolls away from a stream. Presentational — visibility and the scroll itself come from `useStickToBottom`.',
      },
    },
  },
  decorators: [(Story) => <div className="relative h-24">{Story()}</div>],
} satisfies Meta<typeof ScrollToBottomButton>

export default meta
type Story = StoryObj<typeof meta>

export const Visible: Story = {}

export const CustomLabel: Story = { args: { label: '3 new messages' } }

/**
 * Wired to `useStickToBottom` over a growing list. Scroll up while lines keep
 * arriving and the pill appears; click it to follow the stream again.
 */
export const WithStickToBottom: Story = {
  decorators: [],
  render: function StreamStory() {
    const { containerRef, contentRef, atBottom, scrollToBottom } = useStickToBottom({
      threshold: 48,
    })
    const [lines, setLines] = useState(() => Array.from({ length: 12 }, (_, i) => i + 1))
    useEffect(() => {
      const id = setInterval(() => setLines((l) => [...l, l.length + 1]), 900)
      return () => clearInterval(id)
    }, [])
    return (
      <div className="relative h-72 w-96 overflow-hidden rounded-control border border-line bg-panel-solid">
        <div ref={containerRef} className="h-full overflow-y-auto">
          <div ref={contentRef} className="flex flex-col gap-1 p-3 text-[13px] text-ink">
            {lines.map((n) => (
              <p key={n}>Streamed line {n}</p>
            ))}
          </div>
        </div>
        <ScrollToBottomButton visible={!atBottom} onClick={() => scrollToBottom()} />
      </div>
    )
  },
}
