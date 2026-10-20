import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { suggestions } from '../../fixtures/chat'
import { SuggestedQuestions } from './suggested-questions'
import { SuggestionsMenu } from './suggestions-menu'

const meta = {
  title: 'Chat/Components/Suggestions',
  component: SuggestionsMenu,
  tags: ['autodocs'],
  args: {
    suggestions,
    onPick: fn(),
    onQueue: fn(),
    typeahead: true,
    onTypeaheadChange: fn(),
    compact: false,
    placement: 'down',
  },
  render: function MenuStory(args) {
    const [typeahead, setTypeahead] = useState(args.typeahead)
    return <SuggestionsMenu {...args} typeahead={typeahead} onTypeaheadChange={setTypeahead} />
  },
  decorators: [(Story) => <div className="min-h-96">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'Today’s suggested questions. `SuggestionsMenu` is the composer’s sparkle drop-up — picking fills the draft, never sends; the footer switches suggest-as-you-type. `SuggestedQuestions` is the empty state’s grid, where a pick asks straight away.',
      },
    },
  },
} satisfies Meta<typeof SuggestionsMenu>

export default meta
type Story = StoryObj<typeof meta>

/** Open the sparkle trigger. */
export const Menu: Story = {}

export const MenuCompact: Story = { args: { compact: true } }

/** Without `onQueue`, rows offer no queue button. */
export const MenuWithoutQueue: Story = { args: { onQueue: undefined } }

export const EmptyStateGrid: Story = {
  render: () => (
    <div className="max-w-3xl">
      <SuggestedQuestions suggestions={suggestions} onPick={fn()} />
    </div>
  ),
}

export const EmptyStateSingleColumn: Story = {
  render: () => (
    <div className="max-w-sm">
      <SuggestedQuestions suggestions={suggestions} onPick={fn()} compact limit={3} />
    </div>
  ),
}
