import { describe, expect, it, vi } from 'vitest'
import type { FilterField } from '../filter-panel'
import {
  buildChips,
  buildQuickRows,
  buildSuggestionGroups,
  findMatches,
  countActive,
  describeDates,
  QUICK_OPTIONS_MAX,
} from './filterModel'
import type { FilterTerm, FilterTermField } from './types'

// A Monday in the middle of a quarter, so no preset sits on a boundary.
const today = new Date(2026, 9, 5)

const NONE = { from: null, to: null }
const termFields: FilterTermField[] = [
  { key: 'name', label: 'Name', glyph: 'Aa', param: 'name__icontains' },
  { key: 'email', label: 'Email', glyph: '@', param: 'email__icontains' },
]
const labels = { searchFor: 'Search for', contains: (f: string) => `${f} contains` }

/** A field list with every kind of control, each onChange a spy. */
function fixture(overrides: Record<string, unknown> = {}) {
  const on = {
    status: vi.fn(),
    plan: vi.fn(),
    region: vi.fn(),
    seated: vi.fn(),
    renewal: vi.fn(),
    created: vi.fn(),
    lastActive: vi.fn(),
    due: vi.fn(),
  }
  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: [],
      onChange: on.status,
      options: [
        { value: 'active', label: 'Active', count: 9 },
        { value: 'pending', label: 'Pending', count: 3 },
        { value: 'suspended', label: 'Suspended', count: 2 },
      ],
    },
    {
      id: 'plan',
      label: 'Plan',
      type: 'options',
      multiple: false,
      value: [],
      onChange: on.plan,
      options: [
        { value: 'ent', label: 'Enterprise' },
        { value: 'gro', label: 'Growth' },
      ],
    },
    { id: 'region', label: 'Region', type: 'string', value: '', onChange: on.region },
    { id: 'seated', label: 'Has active seats', type: 'boolean', value: false, onChange: on.seated },
    { id: 'renewal', label: 'Renewal', type: 'date', value: null, onChange: on.renewal },
    {
      id: 'created',
      label: 'Created',
      type: 'dateRange',
      presets: true,
      value: NONE,
      onChange: on.created,
    },
    {
      id: 'due',
      label: 'Due',
      type: 'dateRange',
      presets: true,
      direction: 'future',
      value: NONE,
      onChange: on.due,
    },
    {
      id: 'lastActive',
      label: 'Last active',
      type: 'dateRange',
      presets: true,
      value: NONE,
      onChange: on.lastActive,
    },
  ].map((f) => ({ ...f, ...(overrides[f.id] as object) })) as FilterField[]
  return { fields, on }
}

const noTerms: FilterTerm[] = []

describe('describeDates', () => {
  it('names a whole range, a single day, and a range with one open end', () => {
    expect(describeDates({ from: '2026-09-09', to: '2026-10-08' })).toBe('Sep 9 – Oct 8, 2026')
    expect(describeDates({ from: '2026-10-08', to: '2026-10-08' })).toBe('Oct 8, 2026')
    expect(describeDates({ from: null, to: '2026-10-04' })).toBe('Up to Oct 4, 2026')
    expect(describeDates({ from: '2026-10-01', to: null })).toBe('From Oct 1, 2026')
    expect(describeDates(NONE)).toBe('')
  })
})

describe('buildChips', () => {
  it('draws nothing while nothing is set', () => {
    const { fields } = fixture()
    expect(
      buildChips({ fields, terms: noTerms, termFields, onTermsChange: vi.fn(), today }),
    ).toEqual([])
    expect(countActive(fields)).toBe(0)
  })

  it('puts typed terms first, then each field in the order given, one chip per option', () => {
    const { fields } = fixture({
      status: { value: ['active', 'pending'] },
      region: { value: 'West' },
      seated: { value: true },
    })
    const terms: FilterTerm[] = [
      { id: '1', field: null, value: 'crest' },
      { id: '2', field: 'email', value: '@bank' },
    ]
    const chips = buildChips({ fields, terms, termFields, onTermsChange: vi.fn(), today })
    expect(chips.map((c) => `${c.prefix} ${c.text}`.trim())).toEqual([
      'search: crest',
      'email: @bank',
      'status: Active',
      'status: Pending',
      'region: West',
      'Has active seats',
    ])
    // Terms are not fields: the panel does not show them, so they are not counted.
    expect(countActive(fields)).toBe(3)
  })

  it('names the preset a date range came from, with the dates it stands for', () => {
    const { fields } = fixture({
      created: { value: { from: '2026-09-06', to: '2026-10-05' } },
      due: { value: { from: null, to: '2026-10-04' } },
    })
    const [created, due] = buildChips({
      fields,
      terms: noTerms,
      termFields,
      onTermsChange: vi.fn(),
      today,
    })
    expect(created).toMatchObject({
      prefix: 'created:',
      text: 'Last 30 days',
      detail: 'Sep 6 – Oct 5, 2026',
    })
    expect(due).toMatchObject({ prefix: 'due:', text: 'Overdue', detail: 'Up to Oct 4, 2026' })
  })

  it('falls back to the dates themselves for a range no preset made', () => {
    const { fields } = fixture({ created: { value: { from: '2026-08-02', to: '2026-08-09' } } })
    const [chip] = buildChips({ fields, terms: noTerms, termFields, onTermsChange: vi.fn(), today })
    expect(chip).toMatchObject({ text: 'Aug 2 – Aug 9, 2026', detail: undefined })
  })

  it('removes only what its chip stands for', () => {
    const { fields, on } = fixture({
      status: { value: ['active', 'pending'] },
      created: { value: { from: '2026-09-06', to: '2026-10-05' } },
    })
    const onTermsChange = vi.fn()
    const terms: FilterTerm[] = [
      { id: '1', field: null, value: 'a' },
      { id: '2', field: null, value: 'b' },
    ]
    const chips = buildChips({ fields, terms, termFields, onTermsChange, today })
    chips[0].remove()
    expect(onTermsChange).toHaveBeenCalledWith([terms[1]])
    chips.find((c) => c.text === 'Active')!.remove()
    expect(on.status).toHaveBeenCalledWith(['pending'])
    chips.find((c) => c.prefix === 'created:')!.remove()
    expect(on.created).toHaveBeenCalledWith(NONE)
  })

  it('gives every chip an id that is unique and stable', () => {
    const { fields } = fixture({ status: { value: ['active', 'pending'] } })
    const chips = buildChips({ fields, terms: noTerms, termFields, onTermsChange: vi.fn(), today })
    expect(new Set(chips.map((c) => c.id)).size).toBe(chips.length)
    expect(chips.map((c) => c.id)).toEqual(['field:status:active', 'field:status:pending'])
  })
})

describe('buildSuggestionGroups', () => {
  const build = (query: string, fields: FilterField[], terms = noTerms, onTermsChange = vi.fn()) =>
    buildSuggestionGroups({
      query,
      fields,
      terms,
      termFields,
      onTermsChange,
      today,
      newId: () => 'new',
      labels,
    })

  it('suggests nothing for an empty or blank query', () => {
    const { fields } = fixture()
    expect(build('', fields)).toEqual([])
    expect(build('   ', fields)).toEqual([])
  })

  it('with nothing in the data or filters to match, starts with search, then narrowing', () => {
    const { fields } = fixture()
    const groups = build('crest', fields)
    expect(groups.map((g) => g.id)).toEqual(['search', 'terms'])
    expect(groups[0].items[0]).toMatchObject({ strong: '“crest”', hint: '?search=crest' })
    expect(groups[1].items.map((i) => i.hint)).toEqual(['name__icontains', 'email__icontains'])
  })

  it('commits a typed term when a search or a narrowing is chosen', () => {
    const { fields } = fixture()
    const onTermsChange = vi.fn()
    const groups = build('crest', fields, noTerms, onTermsChange)
    groups[0].items[0].run()
    expect(onTermsChange).toHaveBeenLastCalledWith([{ id: 'new', field: null, value: 'crest' }])
    groups[1].items[1].run()
    expect(onTermsChange).toHaveBeenLastCalledWith([{ id: 'new', field: 'email', value: 'crest' }])
  })

  it('lists the date presets that match, naming the date each belongs to', () => {
    const { fields } = fixture()
    const dates = build('30', fields).find((g) => g.id === 'dates')!
    expect(dates.items.map((i) => `${i.lead}${i.strong}`)).toEqual([
      'Created · Last 30 days',
      'Due · Next 30 days',
      'Last active · Last 30 days',
    ])
  })

  it('ranks the date named in the query ahead of dates that only match a preset', () => {
    const { fields } = fixture()
    const dates = build('due', fields).find((g) => g.id === 'dates')!
    expect(dates.items.every((i) => i.lead.startsWith('Due'))).toBe(true)
  })

  it('applies a date suggestion by handing the preset range to the field', () => {
    const { fields, on } = fixture()
    const dates = build('30', fields).find((g) => g.id === 'dates')!
    dates.items[0].run()
    expect(on.created).toHaveBeenCalledWith({ from: '2026-09-06', to: '2026-10-05' })
    dates.items[1].run()
    expect(on.due).toHaveBeenCalledWith({ from: '2026-10-05', to: '2026-11-03' })
  })

  it('lists matching values, skips ones already chosen, and respects a single choice', () => {
    const { fields, on } = fixture({ status: { value: ['active'] } })
    const values = build('pe', fields).find((g) => g.id === 'values')!
    expect(values.items.map((i) => i.strong)).toEqual(['Pending', 'Suspended'])
    const flag = build('seats', fields).find((g) => g.id === 'values')!
    expect(flag.items.map((i) => i.strong)).toEqual(['Has active seats'])
    const grown = build('pend', fields).find((g) => g.id === 'values')!
    grown.items[0].run()
    expect(on.status).toHaveBeenCalledWith(['active', 'pending'])
    build('gro', fields)
      .find((g) => g.id === 'values')!
      .items[0].run()
    expect(on.plan).toHaveBeenCalledWith(['gro'])
  })

  it('puts values before dates when a value starts with what was typed', () => {
    const { fields } = fixture()
    // "act" starts "Active", and only appears inside "Last active".
    expect(build('act', fields).map((g) => g.id)).toEqual(['values', 'dates', 'search', 'terms'])
    // "renew" is a date field and no value starts with it.
    expect(build('renew', fields).map((g) => g.id)).toEqual(['search', 'terms'])
    expect(build('over', fields).map((g) => g.id)).toEqual(['dates', 'search', 'terms'])
  })

  it('caps the dates and the values listed, never search', () => {
    const { fields } = fixture()
    // "last" matches far more than four date presets; "e" matches more than three values.
    const dates = build('last', fields).find((g) => g.id === 'dates')!
    expect(dates.items).toHaveLength(4)
    const values = build('e', fields).find((g) => g.id === 'values')!
    expect(values.items).toHaveLength(3)
    expect(build('last', fields).find((g) => g.id === 'search')!.items).toHaveLength(1)
  })

  it('leaves out the narrowing group when there are no fields to narrow to', () => {
    const { fields } = fixture()
    const groups = buildSuggestionGroups({
      query: 'crest',
      fields,
      terms: noTerms,
      termFields: [],
      onTermsChange: vi.fn(),
      today,
      labels,
    })
    expect(groups.map((g) => g.id)).toEqual(['search'])
  })
})

describe('matches from the data', () => {
  const rows = [
    { name: 'Bayshore Financial', email: 'marcus@bayshore.example' },
    { name: 'Bay Ridge Credit Union', email: 'baylee@bayridge.example' },
    { name: 'Crestview Bank', email: 'sarah@crestview.example' },
    { name: 'Bayshore Financial', email: 'dup@bayshore.example' },
  ]

  it('finds each value once, values that start with the query first', () => {
    expect(findMatches('bay', rows, termFields)).toEqual([
      { field: 'name', value: 'Bayshore Financial' },
      { field: 'name', value: 'Bay Ridge Credit Union' },
      { field: 'email', value: 'baylee@bayridge.example' },
      { field: 'email', value: 'marcus@bayshore.example' },
      { field: 'email', value: 'dup@bayshore.example' },
    ])
    expect(findMatches('  ', rows, termFields)).toEqual([])
  })

  it('lists them first, and picking one adds an exact term', () => {
    const { fields } = fixture()
    const onTermsChange = vi.fn()
    const groups = buildSuggestionGroups({
      query: 'bay',
      fields,
      terms: noTerms,
      termFields,
      onTermsChange,
      today,
      matches: findMatches('bay', rows, termFields),
      newId: () => 'new',
      labels,
    })
    expect(groups[0].id).toBe('matches')
    expect(groups.at(-2)!.id).toBe('search')
    const first = groups[0].items[0]
    expect(`${first.lead}[${first.strong}]${first.tail}`).toBe('[Bay]shore Financial')
    expect(first.hint).toBe('in Name')
    first.run()
    expect(onTermsChange).toHaveBeenLastCalledWith([
      { id: 'new', field: 'name', value: 'Bayshore Financial', exact: true },
    ])
  })

  it('leaves out a value already picked, and names it "is" in its chip', () => {
    const { fields } = fixture()
    const picked: FilterTerm[] = [
      { id: 'a', field: 'name', value: 'Bayshore Financial', exact: true },
    ]
    const groups = buildSuggestionGroups({
      query: 'bay',
      fields,
      terms: picked,
      termFields,
      onTermsChange: vi.fn(),
      today,
      matches: [{ field: 'name', value: 'Bayshore Financial' }],
      labels,
    })
    expect(groups.map((g) => g.id)).not.toContain('matches')
    const chips = buildChips({ fields, terms: picked, termFields, onTermsChange: vi.fn(), today })
    expect(chips[0]).toMatchObject({ prefix: 'name is', text: 'Bayshore Financial' })
  })
})

describe('buildQuickRows', () => {
  it('has a row per date, with only the presets that have a short label', () => {
    const { fields } = fixture()
    const rows = buildQuickRows(fields, today)
    const created = rows.find((r) => r.id === 'created')!
    expect(created.picks.map((p) => p.label)).toEqual(['7D', '30D', '90D', 'YTD'])
    expect(rows.find((r) => r.id === 'due')!.picks.map((p) => p.label)).toEqual([
      'Overdue',
      'Next 7D',
      'Next 30D',
      'Quarter',
    ])
  })

  it('lists the dates first, then the filters that are small enough to be a row', () => {
    const { fields } = fixture()
    expect(buildQuickRows(fields, today).map((r) => r.kind)).toEqual([
      'date',
      'date',
      'date',
      'options',
      'options',
      'boolean',
    ])
  })

  it('leaves a long list in the panel and a string or single date out altogether', () => {
    const many = Array.from({ length: QUICK_OPTIONS_MAX + 1 }, (_, i) => ({
      value: `${i}`,
      label: `Owner ${i}`,
    }))
    const { fields } = fixture({ plan: { options: many } })
    const ids = buildQuickRows(fields, today).map((r) => r.id)
    expect(ids).not.toContain('plan')
    expect(ids).not.toContain('region')
    expect(ids).not.toContain('renewal')
  })

  it('marks the pick that is on, shows its dates, and clears it when pressed again', () => {
    const { fields, on } = fixture({ created: { value: { from: '2026-09-06', to: '2026-10-05' } } })
    const created = buildQuickRows(fields, today).find((r) => r.id === 'created')!
    const on30 = created.picks.find((p) => p.label === '30D')!
    expect(on30.pressed).toBe(true)
    expect(created.picks.filter((p) => p.pressed)).toHaveLength(1)
    expect(created.detail).toBe('Sep 6 – Oct 5, 2026')
    expect(created.custom).toBe(false)
    on30.toggle()
    expect(on.created).toHaveBeenCalledWith(NONE)
    created.picks.find((p) => p.label === '7D')!.toggle()
    expect(on.created).toHaveBeenLastCalledWith({ from: '2026-09-29', to: '2026-10-05' })
  })

  it('flags a date range that no pick covers as custom', () => {
    const { fields } = fixture({ created: { value: { from: '2026-08-02', to: '2026-08-09' } } })
    const created = buildQuickRows(fields, today).find((r) => r.id === 'created')!
    expect(created.custom).toBe(true)
    expect(created.picks.some((p) => p.pressed)).toBe(false)
  })

  it('toggles option picks on and off, and keeps a single choice single', () => {
    const { fields, on } = fixture({ status: { value: ['active'] } })
    const rows = buildQuickRows(fields, today)
    const status = rows.find((r) => r.id === 'status')!
    expect(status.picks.map((p) => p.count)).toEqual([9, 3, 2])
    status.picks[1].toggle()
    expect(on.status).toHaveBeenCalledWith(['active', 'pending'])
    status.picks[0].toggle()
    expect(on.status).toHaveBeenLastCalledWith([])
    rows.find((r) => r.id === 'plan')!.picks[1].toggle()
    expect(on.plan).toHaveBeenCalledWith(['gro'])
  })

  it('turns a boolean filter on and off with one pick', () => {
    const { fields, on } = fixture()
    buildQuickRows(fields, today)
      .find((r) => r.id === 'seated')!
      .picks[0].toggle()
    expect(on.seated).toHaveBeenCalledWith(true)
  })
})
