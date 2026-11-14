import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Omnibox } from './omnibox'
import type { OmniboxChip, OmniboxGroup, OmniboxProps } from './types'

const FIELDS = [
  { key: 'name', label: 'Name', glyph: 'Aa', param: 'name__icontains' },
  { key: 'email', label: 'Email', glyph: '@', param: 'email__icontains' },
  { key: 'contact', label: 'Primary contact', glyph: '◔', param: 'contact__icontains' },
]

const kbd = (
  <kbd className="shrink-0 rounded border border-line bg-canvas px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
    ⌘K
  </kbd>
)

/**
 * The DataTable toolbar's search: typing proposes, choosing commits. Each
 * suggestion names the query parameter it would produce, so the difference
 * between "search everything" and "narrow a field" is visible before you pick.
 */
function Host({
  initialChips = [] as OmniboxChip[],
  hints,
  quick,
  shortcut,
  className = 'w-[36rem] max-w-full',
}: {
  initialChips?: OmniboxChip[]
  hints?: React.ReactNode
  quick?: OmniboxProps['quick']
  shortcut?: string
  className?: string
}) {
  const [draft, setDraft] = useState('')
  const [chips, setChips] = useState<OmniboxChip[]>(initialChips)
  const remove = (id: string) => setChips((c) => c.filter((x) => x.id !== id))
  const add = (chip: Omit<OmniboxChip, 'onRemove'>) => {
    setChips((c) => [...c, { ...chip, onRemove: () => remove(chip.id) }])
    setDraft('')
  }
  const q = draft.trim()
  const groups: OmniboxGroup[] = q
    ? [
        {
          id: 'all',
          label: 'Search every field',
          items: [
            {
              id: 'search-all',
              icon: '⌕',
              label: (
                <>
                  Search for <strong className="font-extrabold">“{q}”</strong>
                </>
              ),
              hint: `?search=${q}`,
              onSelect: () => add({ id: `search-${Date.now()}`, prefix: 'search:', label: q }),
            },
          ],
        },
        {
          id: 'fields',
          label: 'Narrow to a field',
          items: FIELDS.map((f) => ({
            id: f.key,
            icon: f.glyph,
            label: (
              <>
                {f.label} contains <strong className="font-extrabold">{q}</strong>
              </>
            ),
            hint: f.param,
            onSelect: () =>
              add({ id: `${f.key}-${Date.now()}`, prefix: `${f.label.toLowerCase()}:`, label: q }),
          })),
        },
      ]
    : []
  return (
    <Omnibox
      label="Search and filter tenants"
      placeholder="Search, or type to narrow to a field…"
      value={draft}
      onValueChange={setDraft}
      chips={chips.map((c) => ({ ...c, onRemove: c.onRemove ?? (() => remove(c.id)) }))}
      groups={groups}
      onRemoveLast={() => setChips((c) => c.slice(0, -1))}
      suffix={kbd}
      hints={hints}
      quick={quick}
      shortcut={shortcut}
      className={className}
    />
  )
}

const meta = {
  title: 'Components/Omnibox',
  component: Omnibox,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="min-h-80">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'One field for free-text search and field-scoped filters. Active filters render as chips inside the outline; Backspace on an empty field removes the last one when `onRemoveLast` is given. Type to see the suggestion groups.',
      },
    },
  },
} satisfies Meta<typeof Omnibox>

export default meta
type Story = StoryObj<typeof Omnibox>

export const Empty: Story = { render: () => <Host /> }

export const WithChips: Story = {
  render: () => (
    <Host
      initialChips={[
        { id: 's', prefix: 'search:', label: 'crest' },
        { id: 'st', prefix: 'status:', label: 'Active' },
        { id: 't', prefix: 'tier:', label: 'Enterprise' },
      ]}
    />
  ),
}

const MANY: OmniboxChip[] = [
  { id: '1', prefix: 'search:', label: 'crest' },
  { id: '2', prefix: 'status:', label: 'Active' },
  { id: '3', prefix: 'status:', label: 'Pending' },
  { id: '4', prefix: 'tier:', label: 'Enterprise' },
  { id: '5', prefix: 'tier:', label: 'Growth' },
  { id: '6', prefix: 'region:', label: 'Northeast' },
  { id: '7', prefix: 'region:', label: 'Midwest' },
  { id: '8', prefix: 'created:', label: 'Last 90 days' },
  { id: '9', prefix: 'renewal:', label: 'Next 30 days' },
  { id: '10', prefix: 'name:', label: 'bank' },
  {
    id: 'long',
    prefix: 'search:',
    label: 'a search term that goes on far longer than any field could hold on one line',
    title: 'search: a search term that goes on far longer than any field could hold on one line',
  },
]

/**
 * More chips than one line holds. They wrap and the field grows, so none is hidden or pushed off
 * the edge. A chip longer than the field ends in an ellipsis, keeps its remove button, and shows
 * all of itself on hover.
 */
export const ManyChips: Story = { render: () => <Host initialChips={MANY} /> }

/**
 * `quick` is what an empty, focused field offers instead of nothing. Typing swaps it for the
 * suggestions; ⌘K or Ctrl+K focuses the field from anywhere.
 */
export const QuickPicks: Story = {
  render: () => (
    <Host
      shortcut="k"
      quick={({ close }) => (
        <div className="flex flex-col gap-2 p-1">
          <div className="flex items-center gap-1.5">
            <span className="w-16 text-[13px] font-bold text-ink-strong">Created</span>
            {['7D', '30D', '90D'].map((label) => (
              <button
                key={label}
                type="button"
                className="h-[26px] rounded-control border border-line px-2.5 text-[12px] font-bold"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={close}
            className="self-start rounded px-1.5 py-0.5 text-[11.5px] font-bold text-brand-fg"
          >
            Close
          </button>
        </div>
      )}
    />
  ),
}
