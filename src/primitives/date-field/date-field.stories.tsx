import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from '../button'
import { Modal } from '../modal'
import { DateField, DateRangeField } from './date-field'
import type { DateRange, DateRangeFieldProps, IsoDate } from './types'

const meta = {
  title: 'Primitives/DateField',
  component: DateField,
  tags: ['autodocs'],
  args: {
    label: 'Renewal date',
    showLabel: true,
    value: '2026-09-30',
    onChange: fn(),
    disabled: false,
  },
  argTypes: { presets: { control: 'boolean' } },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
  render: function DateStory(args) {
    const [value, setValue] = useState<IsoDate>(args.value)
    return (
      <DateField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          args.onChange(next)
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        component:
          'A date, typed or picked. The field shows the value as people read it ("Sep 30, 2026") and hands back ISO `YYYY-MM-DD`; it accepts `Sep 30, 2026`, `9/30/2026` and `2026-09-30`, and a day that does not exist says so by name. The calendar button (or Alt+↓) opens the branded `DatePicker` in a popover that escapes clipping containers and open dialogs. `presets` swaps typing for quick picks — the field then shows the matching pick as a chip, for tight spaces. The calendar is loaded on first open, not with the field.',
      },
    },
  },
} satisfies Meta<typeof DateField>

export default meta
type Story = StoryObj<typeof meta>

/** Direction A, the default: type it or open the calendar. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open calendar' }))
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: 'Renewal date',
    })
    const day = (await within(dialog).findAllByRole('gridcell')).find(
      (el) => el.textContent === '18',
    )!
    await userEvent.click(day)
    await expect(args.onChange).toHaveBeenCalledWith('2026-09-18')
    await expect(canvas.getByRole('textbox', { name: 'Renewal date' })).toHaveValue('Sep 18, 2026')
  },
}

export const Empty: Story = { args: { value: null } }

/** A host's own validation message, wired as the field's description. */
export const WithError: Story = { args: { error: 'Renewal must be after the start date.' } }

/** Type "Feb 30, 2027" and leave the field — the message names the problem. */
export const TypingHelp: Story = { args: { value: null, placeholder: 'Try Feb 30, 2027' } }

export const Bounded: Story = { args: { min: '2026-09-10', max: '2026-10-20' } }

export const Disabled: Story = { args: { disabled: true } }

/** Direction C: quick picks instead of typing — the chip names the pick. */
export const WithPresets: Story = { args: { presets: true, value: null } }

// --- Range ------------------------------------------------------------------

function Range(props: Partial<DateRangeFieldProps> & { initial?: DateRange }) {
  const [value, setValue] = useState<DateRange>(
    props.initial ?? { from: '2026-09-06', to: '2026-09-15' },
  )
  return <DateRangeField label="Report dates" {...props} value={value} onChange={setValue} />
}

/** One calendar, two clicks, Apply — "Sep 6 – Sep 15, 2026 · 10 days". */
export const RangeDefault: Story = { render: () => <Range /> }

export const RangeEmpty: Story = { render: () => <Range initial={{ from: null, to: null }} /> }

/**
 * Direction C for ranges: "Last 30 days" says what the range means in far less
 * width than two dates. The picks sit beside the calendar.
 */
export const RangeWithPresets: Story = {
  render: function PresetsStory() {
    const today = new Date()
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
    return <Range presets initial={{ from: iso(from), to: iso(today) }} />
  },
}

export const RangeDisabled: Story = { render: () => <Range disabled /> }

// --- In context ---------------------------------------------------------------

/** Inside a native dialog the popover renders in the dialog's top layer, not under it. */
export const InModal: Story = {
  render: function ModalStory() {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<IsoDate>('2026-10-01')
    return (
      <>
        <Button onClick={() => setOpen(true)}>Schedule export</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          size="sm"
          title="Schedule export"
          description="The export runs overnight on the chosen date."
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Schedule
              </Button>
            </>
          }
        >
          <DateField label="Run on" showLabel value={date} onChange={setDate} />
        </Modal>
      </>
    )
  },
}
