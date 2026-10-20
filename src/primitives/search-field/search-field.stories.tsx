import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from './search-field'
const meta = {
  title: 'Primitives/Search field',
  component: SearchField,
  tags: ['autodocs'],
} satisfies Meta<typeof SearchField>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { label: 'Find a tenant', placeholder: 'Find a tenant' } }

export const WithValue: Story = {
  args: { label: 'Find a tenant', placeholder: 'Find a tenant', defaultValue: 'Alderfinch' },
}

export const Disabled: Story = {
  args: {
    label: 'Find a tenant',
    placeholder: 'Find a tenant',
    disabled: true,
    containerClassName: 'opacity-50',
  },
}

const TENANTS = [
  'Alderfinch Treasury',
  'Alderfinch Retail',
  'Harbor Street Credit Union',
  'Crestview Bank',
  'Prosperity Bank',
]

/** The field only holds the text. Filtering is the host's, as here. */
export const FilteringAList: Story = {
  args: { label: 'Find a tenant', placeholder: 'Find a tenant' },
  render: function FilteringAListStory(args) {
    const [query, setQuery] = useState('')
    const shown = TENANTS.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
    return (
      <div className="flex w-80 flex-col gap-2">
        <SearchField {...args} value={query} onChange={(event) => setQuery(event.target.value)} />
        <ul className="flex flex-col text-sm text-ink">
          {shown.map((name) => (
            <li key={name} className="px-3 py-1.5">
              {name}
            </li>
          ))}
        </ul>
        {shown.length === 0 && (
          <p className="px-3 text-[13px] text-ink-soft">No tenant matches “{query.trim()}”.</p>
        )}
      </div>
    )
  },
}
