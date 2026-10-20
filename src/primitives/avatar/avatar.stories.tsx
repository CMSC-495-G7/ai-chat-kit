import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { UserIcon } from '../icons'
import { Avatar } from './avatar'

// A data URI rather than a file, so the story works wherever the folder is copied.
const PORTRAIT =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0a2440"/><circle cx="32" cy="25" r="11" fill="#7dabdb"/><path d="M12 58c3-12 11-18 20-18s17 6 20 18" fill="#7dabdb"/></svg>',
  )

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { variant: 'text', text: 'CS', size: 'md', tone: 'accent' },
  parameters: {
    docs: {
      description: {
        component:
          'Identity with explicit text, image or icon content. Adding `onClick` promotes the same visual to a native button; a static avatar stays non-interactive.',
      },
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
// Typed against the component, not `meta`: its props are a discriminated union, so no
// single set of meta args can satisfy every story.
type Story = StoryObj<typeof Avatar>

export const Playground: Story = {}

export const Text: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar variant="text" text="A" size="lg" tone="accent" />
      <Avatar variant="text" text="AN" size="lg" />
      <Avatar variant="text" text="A" size="sm" />
      <Avatar variant="text" text="AN" size="xs" tone="brand" />
      <Avatar variant="text" text="32" size={32} tone="soft" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(['neutral', 'soft', 'brand', 'accent'] as const).map((tone) => (
        <Avatar key={tone} variant="text" text={tone.slice(0, 2).toUpperCase()} tone={tone} />
      ))}
    </div>
  ),
}

export const Image: Story = {
  args: { variant: 'image', src: PORTRAIT, alt: 'Dana Whitfield', size: 'lg' },
}

export const Icon: Story = {
  args: { variant: 'icon', icon: <UserIcon />, label: 'Unassigned user', tone: 'brand' },
}

export const Clickable: Story = {
  render: function ClickableStory() {
    const [selected, setSelected] = useState(false)
    return (
      <div className="flex items-center gap-3">
        <Avatar
          variant="text"
          text="CS"
          tone={selected ? 'brand' : 'accent'}
          aria-label="Open Christian's profile"
          aria-pressed={selected}
          onClick={() => setSelected((s) => !s)}
        />
        <Avatar
          variant="icon"
          icon={<UserIcon />}
          label="Open account menu"
          onClick={() => setSelected((s) => !s)}
        />
      </div>
    )
  },
}

export const Square: Story = {
  args: { variant: 'text', text: 'AT', shape: 'square', tone: 'brand' },
}
