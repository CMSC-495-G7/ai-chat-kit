import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomeIcon, LibraryIcon, PlanIcon, RefreshIcon, SearchIcon, SparkleIcon } from '../icons'
import { ChoiceCard } from './choice-card'

const meta = {
  title: 'Primitives/ChoiceCard',
  component: ChoiceCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A radio or checkbox with a larger visual surface. The controlled native input still owns form submission, `required`, keyboard behaviour and screen-reader state.',
      },
    },
  },
} satisfies Meta<typeof ChoiceCard>

export default meta
type Story = StoryObj<typeof ChoiceCard>

export const RadioGroup: Story = {
  render: function RadioStory() {
    const [plan, setPlan] = useState('home-equity')
    const options = [
      {
        value: 'home-equity',
        label: 'Home equity',
        description: 'Use available home value',
        icon: <HomeIcon />,
      },
      {
        value: 'line-of-credit',
        label: 'Line of credit',
        description: 'Flexible access as needed',
        icon: <PlanIcon />,
      },
      {
        value: 'refinance',
        label: 'Refinance',
        description: 'Currently unavailable',
        icon: <RefreshIcon />,
        disabled: true,
      },
    ]
    return (
      <fieldset className="grid w-full max-w-3xl grid-cols-3 gap-3 max-md:grid-cols-1">
        <legend className="sr-only">Financing product</legend>
        {options.map((o) => (
          <ChoiceCard
            key={o.value}
            type="radio"
            name="story-plan"
            value={o.value}
            checked={plan === o.value}
            onChange={(e) => setPlan(e.currentTarget.value)}
            label={o.label}
            description={o.description}
            icon={o.icon}
            disabled={o.disabled}
          />
        ))}
      </fieldset>
    )
  },
}

export const CheckboxGroup: Story = {
  render: function CheckboxStory() {
    const [features, setFeatures] = useState<string[]>(['citations'])
    const options = [
      {
        value: 'citations',
        label: 'Citations',
        description: 'Show supporting sources',
        icon: <LibraryIcon />,
      },
      {
        value: 'search',
        label: 'Web search',
        description: 'Find current information',
        icon: <SearchIcon />,
      },
      {
        value: 'starters',
        label: 'Prompt starters',
        description: 'Offer suggested questions',
        icon: <SparkleIcon />,
      },
    ]
    return (
      <fieldset className="grid w-full max-w-3xl grid-cols-3 gap-3 max-md:grid-cols-1">
        <legend className="sr-only">Assistant features</legend>
        {options.map((o) => (
          <ChoiceCard
            key={o.value}
            type="checkbox"
            name="story-features"
            value={o.value}
            checked={features.includes(o.value)}
            onChange={(e) => {
              const on = e.currentTarget.checked
              setFeatures((f) => (on ? [...f, o.value] : f.filter((v) => v !== o.value)))
            }}
            label={o.label}
            description={o.description}
            icon={o.icon}
          />
        ))}
      </fieldset>
    )
  },
}

export const WithoutIcons: Story = {
  render: function PlainStory() {
    const [value, setValue] = useState('monthly')
    return (
      <fieldset className="grid max-w-md grid-cols-2 gap-3">
        <legend className="sr-only">Billing cycle</legend>
        {[
          ['monthly', 'Monthly', '$24 / seat'],
          ['annual', 'Annual', '$19 / seat, billed yearly'],
        ].map(([v, label, description]) => (
          <ChoiceCard
            key={v}
            type="radio"
            name="story-billing"
            value={v}
            checked={value === v}
            onChange={(e) => setValue(e.currentTarget.value)}
            label={label}
            description={description}
          />
        ))}
      </fieldset>
    )
  },
}
