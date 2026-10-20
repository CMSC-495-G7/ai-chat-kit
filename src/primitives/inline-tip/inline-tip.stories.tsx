import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../button'
import { BulbIcon } from '../icons'
import { InlineTip } from './inline-tip'

const meta = {
  title: 'Primitives/InlineTip',
  component: InlineTip,
  tags: ['autodocs'],
  args: {
    icon: <BulbIcon width={14} height={14} />,
    children: 'Select any numbered citation to open its original source.',
  },
  argTypes: { icon: { control: false }, children: { control: 'text' } },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'One piece of product knowledge, said once where it matters — never a modal, never a tour. Pair it with `useDismissableTip` under a surface-specific key so a dismissal sticks.',
      },
    },
  },
} satisfies Meta<typeof InlineTip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Dismissible: Story = {
  args: { onDismiss: fn(), dismissLabel: 'Dismiss citation tip' },
  render: function DismissStory(args) {
    const [shown, setShown] = useState(true)
    return shown ? (
      <InlineTip
        {...args}
        onDismiss={() => {
          setShown(false)
          args.onDismiss?.()
        }}
      />
    ) : (
      <Button size="sm" onClick={() => setShown(true)}>
        Show the tip again
      </Button>
    )
  },
}

export const WithoutIcon: Story = { args: { icon: undefined } }
