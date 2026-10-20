import { useArgs } from 'storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { DatePicker } from './date-picker'
import type { DateRange, IsoDate } from '../date-field'
import type { DatePickerProps } from './types'

const meta = {
  title: 'Primitives/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { label: 'Renewal date', value: '2026-09-15', onChange: fn() },
  render: function ControlledStory() {
    const [args, updateArgs] = useArgs<DatePickerProps>()
    if (args.mode === 'range')
      return (
        <DatePicker
          {...args}
          onChange={(next: DateRange) => {
            updateArgs({ value: next })
            args.onChange(next)
          }}
        />
      )
    return (
      <DatePicker
        {...args}
        onChange={(next: IsoDate) => {
          updateArgs({ value: next })
          args.onChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof DatePicker>
export default meta
type Story = StoryObj<typeof DatePicker>
export const Playground: Story = {}
export const WithApply: Story = {
  args: { commitMode: 'apply' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const day = canvas.getAllByRole('gridcell').find((el) => el.textContent === '18')!
    await userEvent.click(day)
    await expect(args.onChange).not.toHaveBeenCalled()
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
    await expect(args.onChange).not.toHaveBeenCalled()
    await userEvent.click(day)
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await expect(args.onChange).toHaveBeenCalledWith('2026-09-18')
  },
}
export const Range: Story = {
  args: {
    mode: 'range',
    label: 'Report dates',
    value: { from: '2026-09-06', to: '2026-09-15' },
    onChange: fn(),
    commitMode: 'apply',
  },
}
export const Empty: Story = { args: { mode: 'single', value: null } }
export const Bounded: Story = { args: { min: '2026-09-10', max: '2026-09-20' } }
export const Disabled: Story = { args: { disabled: true, commitMode: 'apply' } }
