import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { Stepper } from './stepper'
const meta = { title: 'Primitives/Stepper', component: Stepper, tags: ['autodocs'] } satisfies Meta<
  typeof Stepper
>
export default meta
type Story = StoryObj<typeof meta>
const STEPS = ['Source', 'Connect', 'Schedule', 'Review']
export const Default: Story = {
  args: { steps: ['Source', 'Connect', 'Schedule', 'Review'], current: 1 },
}

export const FirstStep: Story = { args: { steps: STEPS, current: 0 } }

export const LastStep: Story = { args: { steps: STEPS, current: STEPS.length - 1 } }

/** The host owns the position; the stepper only shows it. */
export const DrivenByAFlow: Story = {
  args: { steps: STEPS, current: 0 },
  render: function DrivenByAFlowStory({ steps }) {
    const [current, setCurrent] = useState(0)
    return (
      <div className="flex gap-12 max-lg:flex-col max-lg:gap-6">
        <Stepper steps={steps} current={current} />
        <div className="flex flex-col items-start gap-4">
          <h2 className="text-2xl text-ink-strong">{steps[current]}</h2>
          <div className="flex gap-2">
            <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
              Go back
            </Button>
            <Button
              variant="primary"
              disabled={current === steps.length - 1}
              onClick={() => setCurrent(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  },
}
