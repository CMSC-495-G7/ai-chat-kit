import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { personas } from '../../fixtures/chat'
import { PersonaMenu } from './persona-menu'

const meta = {
  title: 'Chat/Components/PersonaMenu',
  component: PersonaMenu,
  tags: ['autodocs'],
  args: { personas, persona: 'analyst', onChange: fn(), compact: false },
  render: function PersonaStory(args) {
    const [persona, setPersona] = useState(args.persona)
    return (
      <PersonaMenu
        {...args}
        persona={persona}
        onChange={(id) => {
          setPersona(id)
          args.onChange(id)
        }}
      />
    )
  },
  decorators: [(Story) => <div className="pt-64">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'Persona picker: a labelled pill, or an icon-only circle when `compact`. The labelled pill also collapses on its own — a `@container` query on the composer’s wrapper — once the row is too narrow for it.',
      },
    },
  },
} satisfies Meta<typeof PersonaMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Pill: Story = {}

export const Compact: Story = { args: { compact: true } }

/** Inside a narrow composer the labelled pill gives way to an icon on its
 *  own, through the composer's container query, with no prop involved. */
export const InANarrowComposer: Story = {
  decorators: [
    (Story) => (
      <div className="@container/composer w-56 rounded-control border border-dashed border-line p-3">
        {Story()}
      </div>
    ),
  ],
}

/** Two personas is the smallest list worth a menu. */
export const TwoPersonas: Story = {
  args: { personas: personas.slice(0, 2), persona: 'guide' },
}
