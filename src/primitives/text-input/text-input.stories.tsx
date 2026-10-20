import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchIcon } from '../icons'
import { Field, FieldLabel } from '../field'
import { Pill } from '../pill'
import { TextInput } from './text-input'

const meta = {
  title: 'Primitives/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  args: { 'aria-label': 'Tenant name', placeholder: 'Any name', className: 'w-64' },
  argTypes: {
    icon: { control: false },
    prefix: { control: false },
    suffix: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The shell carries the border and the focus ring; the input inside is transparent. That is what lets prefix chips, a clear button and a ⌘K hint share one outline.',
      },
    },
  },
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <TextInput {...args} size="sm" placeholder="Small" />
      <TextInput {...args} size="md" placeholder="Medium" />
      <TextInput {...args} size="lg" placeholder="Large" />
    </div>
  ),
}

/** A valid field carries a message as well as a mark — never colour alone. */
export const Valid: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="story-valid">Tenant name</FieldLabel>
      <TextInput
        id="story-valid"
        className="w-64"
        defaultValue="Crestview"
        validationState="valid"
        validationMessage="Tenant name is available."
      />
    </Field>
  ),
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'invalid-key' },
}

export const SearchWithClear: Story = {
  render: function SearchStory() {
    const [query, setQuery] = useState('crestview')
    return (
      <TextInput
        aria-label="Search tenants"
        placeholder="Search all fields…"
        icon={<SearchIcon width={15} height={15} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        clearLabel="Clear tenant search"
        className="w-72"
      />
    )
  },
}

export const PrefixAndSuffix: Story = {
  render: () => (
    <TextInput
      aria-label="Search and filter"
      size="lg"
      placeholder="Search, or type a field name…"
      icon={<SearchIcon width={16} height={16} />}
      className="w-[30rem] max-w-full"
      prefix={
        <span className="flex shrink-0 items-center gap-1.5">
          <Pill tone="brand">status: Active</Pill>
          <Pill tone="brand">tier: Enterprise</Pill>
        </span>
      }
      suffix={
        <kbd className="shrink-0 rounded border border-line bg-canvas px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
          ⌘K
        </kbd>
      }
    />
  ),
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked value' } }

/** An inset ring remains visible against an overflow boundary. */
export const InsetFocus: Story = {
  args: { focusRing: 'inset', className: 'w-full' },
  decorators: [
    (Story) => (
      <div className="w-64 overflow-hidden">
        <Story />
      </div>
    ),
  ],
}
