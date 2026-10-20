import { useState } from 'react'
import type { ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from '../text-input'
import * as Icons from './icons'
import type { IconProps } from './types'

const ALL = Object.entries(Icons)
  .filter(([name, value]) => name.endsWith('Icon') && typeof value === 'function')
  .sort(([a], [b]) => a.localeCompare(b)) as [string, ComponentType<IconProps>][]

const meta = {
  title: 'Primitives/Icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `${ALL.length} stroke icons as React components. Each takes \`width\`/\`height\`/\`className\` and every other SVG prop; colour is \`currentColor\`, so text utilities tint them.`,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: function GalleryStory() {
    const [query, setQuery] = useState('')
    const [size, setSize] = useState(20)
    const shown = ALL.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <TextInput
            aria-label="Filter icons"
            placeholder="Filter by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <label className="flex items-center gap-2 text-[12px] text-ink-soft">
            Size
            <input
              type="range"
              min={12}
              max={40}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
            <span className="w-8 tabular-nums">{size}px</span>
          </label>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
          {shown.map(([name, Icon]) => (
            <li
              key={name}
              className="flex flex-col items-center gap-2 rounded-control border border-line bg-panel-solid px-2 py-3 text-ink"
            >
              <Icon width={size} height={size} aria-hidden />
              <code className="truncate text-[11px] text-ink-soft">{name}</code>
            </li>
          ))}
        </ul>
      </div>
    )
  },
}

const SAMPLE = ['SearchIcon', 'ChatIcon', 'WorkflowIcon', 'BellIcon', 'PinIcon', 'CheckIcon']
const sample = ALL.filter(([name]) => SAMPLE.includes(name))

/** One icon draws at any size; 16, 18 and 20 are the ones the library uses. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-ink">
      {[14, 16, 18, 20, 24].map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-10 text-[12px] text-ink-soft tabular-nums">{size}px</span>
          {sample.map(([name, Icon]) => (
            <Icon key={name} width={size} height={size} />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Colour is `currentColor`, so a text utility on the icon or its parent tints it. */
export const Tinted: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        ['text-ink-strong', 'Strong ink'],
        ['text-ink-soft', 'Soft ink'],
        ['text-accent-fg', 'Accent'],
        ['text-danger-fg', 'Danger'],
        ['text-success-fg', 'Success'],
      ].map(([tone, label]) => (
        <div key={tone} className={`flex items-center gap-4 ${tone}`}>
          {sample.map(([name, Icon]) => (
            <Icon key={name} width={20} height={20} />
          ))}
          <span className="text-[12px]">{label}</span>
        </div>
      ))}
    </div>
  ),
}

/** Beside a label an icon is decoration and stays hidden from assistive
 *  technology; on its own it needs a name, which the button around it gives. */
export const WithAndWithoutALabel: Story = {
  render: () => {
    const Search = ALL.find(([name]) => name === 'SearchIcon')![1]
    return (
      <div className="flex items-center gap-4 text-ink">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold">
          <Search width={16} height={16} /> Search chat
        </span>
        <button
          type="button"
          aria-label="Search chat"
          className="grid size-9 place-items-center rounded-control text-ink-soft hover:bg-tint/8"
        >
          <Search width={18} height={18} />
        </button>
      </div>
    )
  },
}
