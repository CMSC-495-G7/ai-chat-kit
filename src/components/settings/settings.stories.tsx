import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SHIPPED_HIGHLIGHTS, SHIPPED_PALETTES } from '../../lib/settings/appearance'
import type { FeatureCatalogue, FeatureFlags } from '../../lib/settings/types'
import { FeatureToggles } from './feature-toggles'
import { HighlightPicker } from './highlight-picker'
import { PalettePicker } from './palette-picker'

type Id = 'suggestions' | 'queue' | 'thinking' | 'tools' | 'sources' | 'followups' | 'audit'

const CATALOGUE: FeatureCatalogue<Id> = [
  {
    id: 'composer',
    title: 'Before you ask',
    description: 'What the message box offers while you write.',
    features: [
      {
        id: 'suggestions',
        label: 'Suggested questions',
        hint: 'The sparkle drop-up, and suggest-as-you-type.',
      },
      {
        id: 'queue',
        label: 'Queueing and steering',
        hint: 'Queue or interrupt while an answer runs.',
      },
    ],
  },
  {
    id: 'before',
    title: 'Before the answer',
    description: 'What the assistant shows while it is still working.',
    features: [
      { id: 'thinking', label: 'Reasoning', hint: 'The collapsible “Thought for Ns” block.' },
      { id: 'tools', label: 'Tool calls', hint: 'Status chips for each tool call.' },
    ],
  },
  {
    id: 'after',
    title: 'After the answer',
    features: [
      {
        id: 'sources',
        label: 'Sources and citations',
        hint: 'Inline [n] markers and the reference panel.',
      },
      { id: 'followups', label: 'Follow-up suggestions' },
      {
        id: 'audit',
        label: 'Audit trail',
        hint: 'Every answer is logged for compliance review.',
        locked: true,
        lockedReason: 'Required by your organisation',
      },
    ],
  },
]

const INITIAL: FeatureFlags<Id> = {
  suggestions: true,
  queue: true,
  thinking: true,
  tools: false,
  sources: true,
  followups: true,
  audit: true,
}

const meta = {
  title: 'Components/Settings',
  component: FeatureToggles,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Data-driven, presentational settings sections: no dialog, no reset, no persistence. `FeatureToggles` renders a `FeatureCatalogue`; entitlement is the host’s job — a feature the tenant lacks is absent, one they may not change is `locked`, and an empty section renders nothing.',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-lg">{Story()}</div>],
} satisfies Meta<typeof FeatureToggles>

export default meta
type Story = StoryObj<typeof FeatureToggles>

export const Toggles: Story = {
  render: function TogglesStory() {
    const [flags, setFlags] = useState(INITIAL)
    return (
      <FeatureToggles
        catalogue={CATALOGUE}
        flags={flags}
        onChange={(id, on) => setFlags((f) => ({ ...f, [id]: on }))}
        intro="Choose what the assistant shows around each answer."
      />
    )
  },
}

/** The spine implies order — right for “before / during / after”, wrong for most settings. */
export const TogglesWithSpine: Story = {
  render: function SpineStory() {
    const [flags, setFlags] = useState(INITIAL)
    return (
      <FeatureToggles
        catalogue={CATALOGUE}
        flags={flags}
        onChange={(id, on) => setFlags((f) => ({ ...f, [id]: on }))}
        spine
      />
    )
  },
}

/** Tiles preview each theme’s dark canvas, panel and action — independent of the active one. */
export const Palette: Story = {
  render: function PaletteStory() {
    const [value, setValue] = useState('default')
    return <PalettePicker options={SHIPPED_PALETTES} value={value} onChange={setValue} />
  },
}

export const Highlight: Story = {
  render: function HighlightStory() {
    const [value, setValue] = useState('orange')
    return (
      <HighlightPicker
        options={SHIPPED_HIGHLIGHTS}
        value={value}
        onChange={setValue}
        title="Citation highlight"
        description="The colour behind a cited passage in the reference panel."
      />
    )
  },
}
