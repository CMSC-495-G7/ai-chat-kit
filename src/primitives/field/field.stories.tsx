import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { Select } from '../select'
import { Slider } from '../slider'
import { TextInput } from '../text-input'
import { Textarea } from '../textarea'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './field'

const meta = {
  title: 'Primitives/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Controls stay atomic. `Field` owns the visible label, description and error relationship; `FieldSet` + `FieldLegend` group related controls. `data-invalid` / `data-disabled` restyle the whole row.',
      },
    },
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const WithDescription: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="f-project">Project name</FieldLabel>
      <TextInput id="f-project" placeholder="Claims assistant" aria-describedby="f-project-help" />
      <FieldDescription id="f-project-help">
        Used in the workspace navigation and audit log.
      </FieldDescription>
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field data-invalid className="max-w-sm">
      <FieldLabel htmlFor="f-key">API key</FieldLabel>
      <TextInput
        id="f-key"
        defaultValue="invalid-key"
        aria-invalid="true"
        aria-describedby="f-key-error"
      />
      <FieldError id="f-key-error">Use a key beginning with sk-.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field data-disabled className="max-w-sm">
      <FieldLabel htmlFor="f-locked">Tenant ID</FieldLabel>
      <TextInput id="f-locked" disabled defaultValue="tnt_8f42c19b" />
    </Field>
  ),
}

/** Every control in one form, the way a settings page composes them. */
export const FormComposition: Story = {
  render: function FormStory() {
    const [budget, setBudget] = useState(45)
    const [plan, setPlan] = useState('team')
    return (
      <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="form-project">Project name</FieldLabel>
            <TextInput id="form-project" placeholder="Claims assistant" />
          </Field>
          <Field>
            <FieldLabel htmlFor="form-description">Instructions</FieldLabel>
            <Textarea
              id="form-description"
              placeholder="Describe how this assistant should respond…"
              aria-describedby="form-description-help"
            />
            <FieldDescription id="form-description-help">
              Plain text, up to 500 characters.
            </FieldDescription>
          </Field>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <Field>
              <FieldLabel htmlFor="form-region">Region</FieldLabel>
              <Select
                id="form-region"
                defaultValue="us-east"
                options={[
                  { value: 'us-east', label: 'US East' },
                  { value: 'us-west', label: 'US West' },
                  { value: 'eu-west', label: 'EU West' },
                ]}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-budget">Monthly budget</FieldLabel>
              <Slider
                id="form-budget"
                min={10}
                max={100}
                step={5}
                value={budget}
                onValueChange={setBudget}
                formatValue={(v) => `$${v}`}
              />
            </Field>
          </div>
          <FieldSet>
            <FieldLegend>Plan</FieldLegend>
            <FieldDescription id="form-plan-help">
              Choose the collaboration level for this workspace.
            </FieldDescription>
            <RadioGroup
              name="form-plan"
              value={plan}
              onValueChange={setPlan}
              aria-describedby="form-plan-help"
            >
              {[
                ['starter', 'Starter'],
                ['team', 'Team'],
                ['enterprise', 'Enterprise'],
              ].map(([value, label]) => (
                <div key={value} className="flex items-center gap-2.5">
                  <RadioGroupItem id={`form-plan-${value}`} value={value} />
                  <FieldLabel htmlFor={`form-plan-${value}`}>{label}</FieldLabel>
                </div>
              ))}
            </RadioGroup>
          </FieldSet>
          <Button type="submit" variant="primary" className="self-start">
            Save settings
          </Button>
        </FieldGroup>
      </form>
    )
  },
}
