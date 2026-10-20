import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PlusIcon, TrashIcon } from '../icons'
import { Button } from '../button'
import { Field, FieldGroup, FieldLabel } from '../field'
import { Select } from '../select'
import { TextInput } from '../text-input'
import { Modal } from './modal'

const meta = {
  title: 'Primitives/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    open: false,
    onOpenChange: fn(),
    title: 'Create workspace',
    description: 'Set the name and region now. You can invite members after creation.',
    size: 'md',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    icon: { control: false },
    footer: { control: false },
    children: { control: false },
    initialFocusRef: { control: false },
  },
  parameters: {
    // The dialog sits in the top layer; give docs pages room to open it inline.
    docs: {
      story: { inline: true, height: '160px' },
      description: {
        component:
          'A controlled native `<dialog>`: real modality, focus containment, Escape dismissal and focus restored to the trigger. Callers compose the footer from `Button`.',
      },
    },
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/** The trigger owns `open`; the modal reports every close through `onOpenChange`. */
export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          {...args}
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            args.onOpenChange(next)
          }}
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p className="text-[13px] text-ink">Body content scrolls independently of the footer.</p>
        </Modal>
      </>
    )
  },
}

export const DestructiveConfirm: Story = {
  render: function DeleteStory() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button
          variant="danger"
          icon={<TrashIcon width={13} height={13} />}
          onClick={() => setOpen(true)}
        >
          Delete tenant
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          size="sm"
          title="Delete Crestview Health?"
          description="This permanently removes the tenant and its workspace data. This action cannot be undone."
          icon={<TrashIcon />}
          iconTone="danger"
          showCloseButton={false}
          footer={
            <>
              <Button autoFocus onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Delete tenant
              </Button>
            </>
          }
        >
          <div className="rounded-surface border border-line bg-tint/4 px-3.5 py-3">
            <p className="font-bold text-ink-strong">Crestview Health</p>
            <p className="mt-0.5 text-xs text-ink-soft">42 members · Enterprise plan</p>
          </div>
        </Modal>
      </>
    )
  },
}

/** `initialFocusRef` lands the cursor in the first field; `expandable` adds 80% mode. */
export const FormWithInitialFocus: Story = {
  render: function WorkspaceStory() {
    const [open, setOpen] = useState(false)
    const nameRef = useRef<HTMLInputElement>(null)
    return (
      <>
        <Button
          variant="primary"
          icon={<PlusIcon width={13} height={13} />}
          onClick={() => setOpen(true)}
        >
          Create workspace
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Create workspace"
          description="Set the name and region now. You can invite members after creation."
          icon={<PlusIcon />}
          initialFocusRef={nameRef}
          expandable
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Create workspace
              </Button>
            </>
          }
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="modal-name">Workspace name</FieldLabel>
              <TextInput
                ref={nameRef}
                id="modal-name"
                placeholder="Claims operations"
                className="w-full"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="modal-region">Region</FieldLabel>
              <Select
                id="modal-region"
                defaultValue="us-east"
                className="w-full"
                options={[
                  { value: 'us-east', label: 'US East' },
                  { value: 'us-west', label: 'US West' },
                  { value: 'eu-west', label: 'EU West' },
                ]}
              />
            </Field>
          </FieldGroup>
        </Modal>
      </>
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null)
    return (
      <div className="flex gap-2">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <Button key={s} onClick={() => setSize(s)}>
            Open {s}
          </Button>
        ))}
        <Modal
          open={size !== null}
          onOpenChange={(o) => !o && setSize(null)}
          size={size ?? 'md'}
          title={`Size: ${size}`}
          description="Width steps; height follows content up to the viewport."
          footer={<Button onClick={() => setSize(null)}>Close</Button>}
        />
      </div>
    )
  },
}
