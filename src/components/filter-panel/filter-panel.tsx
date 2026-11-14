import { useState } from 'react'
import { withDefaults } from '../../lib/withDefaults'
import { PinIcon, SearchIcon, XIcon } from '../../primitives/icons'
import { IconButton } from '../../primitives/icon-button'
import { Checkbox } from '../../primitives/checkbox'
import { DateField } from '../../primitives/date-field'
import { Select } from '../../primitives/select'
import { Switch } from '../../primitives/switch'
import { TextInput } from '../../primitives/text-input'
import { DateSection } from './date-section'
import { hasRange } from './dateFilter'
import type {
  DateRangeFilterField,
  FilterField,
  FilterPanelProps,
  OptionsFilterField,
  FilterPanelLabels,
} from './types'

const SELECT_THRESHOLD = 8

function OptionsField({ field, labels }: { field: OptionsFilterField; labels: FilterPanelLabels }) {
  const { options, value, onChange, multiple = true, selectThreshold = SELECT_THRESHOLD } = field

  // Multiple choice stays multiple choice as the option count grows.
  // Large lists gain a scroll region; only an explicitly single choice uses a select.
  if (!multiple) {
    return (
      <Select
        id={`${field.id}-control`}
        aria-labelledby={`${field.id}-label`}
        size="sm"
        value={value[0] ?? ''}
        onChange={(next) => onChange(next ? [String(next)] : [])}
        className="w-full"
        options={[
          { value: '', label: field.emptyLabel ?? labels.any },
          ...options.map((o) => ({
            value: o.value,
            label: o.count != null ? `${o.label} (${o.count.toLocaleString()})` : o.label,
          })),
        ]}
      />
    )
  }

  return (
    <div
      className={`flex flex-col gap-2 ${options.length > selectThreshold ? 'max-h-64 overflow-y-auto p-1' : ''}`}
    >
      {options.map((o) => (
        <Checkbox
          key={o.value}
          label={o.label}
          meta={o.count?.toLocaleString()}
          checked={value.includes(o.value)}
          onChange={(e) =>
            onChange(e.target.checked ? [...value, o.value] : value.filter((v) => v !== o.value))
          }
        />
      ))}
    </div>
  )
}

/** Draws one field's control. Date ranges are drawn together by `DateSection`, so never reach here. */
function Field({
  field,
  labels,
}: {
  field: Exclude<FilterField, DateRangeFilterField>
  labels: FilterPanelLabels
}) {
  switch (field.type) {
    case 'string':
      return (
        <TextInput
          id={`${field.id}-control`}
          aria-labelledby={`${field.id}-label`}
          size="sm"
          placeholder={field.placeholder ?? labels.any}
          icon={<SearchIcon width={13} height={13} />}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onClear={() => field.onChange('')}
          clearLabel={labels.clearField(field.label)}
          className="w-full"
        />
      )
    case 'options':
      return <OptionsField field={field} labels={labels} />
    case 'boolean':
      return (
        <Switch label={field.label} hideLabel checked={field.value} onChange={field.onChange} />
      )
    case 'date':
      return (
        <DateField
          id={`${field.id}-control`}
          label={field.label}
          value={field.value}
          min={field.min}
          max={field.max}
          presets={field.presets}
          onChange={field.onChange}
        />
      )
  }
}

/**
 * The filter rail, in one component, wherever it is shown.
 *
 * Fields are data. A host describes what can be filtered — a string, a set of
 * options, a boolean, a date, a range — and this decides how each one is
 * drawn. That is what keeps the two placements honest: floating over the
 * table on a narrow screen, docked beside it when pinned, same component
 * either way, so a field can never exist in one and be missing from the other.
 *
 * Inert, like the rest of core: it holds no filter state, counts nothing, and
 * every value and setter belongs to the host.
 */
export function FilterPanel({
  fields,
  title = 'Refine',
  activeCount,
  onReset,
  pinned = false,
  onPinnedChange,
  onClose,
  expandedDate,
  onExpandedDateChange,
  footer,
  layout = 'card',
  className = '',
  labels: overrides,
}: FilterPanelProps) {
  const fill = layout === 'fill'
  const labels: FilterPanelLabels = withDefaults<FilterPanelLabels>(
    {
      reset: 'Reset',
      close: 'Close filters',
      pin: 'Pin filters beside the table',
      unpin: 'Unpin filters — float over the table',
      any: 'Any',
      clearField: (label) => `Clear ${label}`,
      dates: 'Dates',
      anyTime: 'Any time',
    },
    overrides,
  )

  // Date fields share one section, drawn where the first of them sits.
  const dateFields = fields.filter((f): f is DateRangeFilterField => f.type === 'dateRange')
  const [ownExpanded, setOwnExpanded] = useState<string | undefined>()
  const expanded =
    expandedDate ??
    ownExpanded ??
    (dateFields.find((f) => hasRange(f.value)) ?? dateFields[0])?.id ??
    ''
  const expand = (id: string) => {
    setOwnExpanded(id)
    onExpandedDateChange?.(id)
  }
  return (
    <div
      className={[
        fill
          ? 'flex h-full min-h-0 flex-col bg-panel-solid'
          : 'flex flex-col gap-4 rounded-surface border border-line bg-panel-solid p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={
          fill
            ? 'flex h-11 shrink-0 items-center gap-1.5 border-b border-line bg-canvas pr-2 pl-4'
            : 'flex items-center gap-1.5'
        }
      >
        <span className="grow text-[11px] font-extrabold tracking-[0.07em] text-ink-soft uppercase">
          {title}
          {activeCount != null && activeCount > 0 && (
            <span className="ml-1.5 text-accent-fg tabular-nums">{activeCount}</span>
          )}
        </span>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-1 text-[12px] font-bold text-brand-fg"
          >
            {labels.reset}
          </button>
        )}

        {onPinnedChange && (
          <IconButton
            size="sm"
            shape="rounded"
            active={pinned}
            aria-pressed={pinned}
            onClick={() => onPinnedChange(!pinned)}
            aria-label={pinned ? labels.unpin : labels.pin}
            title={pinned ? labels.unpin : labels.pin}
          >
            <PinIcon width={14} height={14} />
          </IconButton>
        )}

        {!pinned && onClose && (
          <IconButton
            size="sm"
            shape="rounded"
            onClick={onClose}
            aria-label={labels.close}
            title={labels.close}
          >
            <XIcon width={13} height={13} />
          </IconButton>
        )}
      </div>

      <div
        className={
          fill ? 'flex min-h-0 grow flex-col gap-4 overflow-y-auto p-4' : 'flex flex-col gap-4'
        }
      >
        {fields.map((field) => {
          if (field.type === 'dateRange') {
            if (field !== dateFields[0]) return null
            return (
              <DateSection
                key="dates"
                fields={dateFields}
                labels={labels}
                expanded={expanded}
                onExpandedChange={expand}
              />
            )
          }
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                {field.type === 'string' || field.type === 'options' ? (
                  <label
                    id={`${field.id}-label`}
                    htmlFor={`${field.id}-control`}
                    className="text-[12.5px] font-extrabold text-ink-strong"
                  >
                    {field.label}
                  </label>
                ) : (
                  <span
                    id={`${field.id}-label`}
                    className="text-[12.5px] font-extrabold text-ink-strong"
                  >
                    {field.label}
                  </span>
                )}
                {field.type === 'boolean' && (
                  <Switch
                    id={`${field.id}-control`}
                    label={field.label}
                    hideLabel
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              </div>
              {field.hint && <span className="text-[11.5px] text-ink-soft">{field.hint}</span>}
              {field.type !== 'boolean' && <Field field={field} labels={labels} />}
            </div>
          )
        })}
        {fill && (
          // Says there is more below while the fields scroll. Sticky, so it rides the bottom
          // edge and lands on the empty padding once the list is scrolled to its end.
          <div
            aria-hidden="true"
            className="pointer-events-none sticky -bottom-4 -mx-4 -mt-10 h-10 shrink-0 bg-linear-to-t from-panel-solid to-transparent"
          />
        )}
      </div>

      {footer && (
        <div
          className={
            fill
              ? 'flex shrink-0 items-center gap-2 border-t border-line bg-canvas px-4 py-3'
              : '-mx-4 -mb-4 flex items-center gap-2 rounded-b-surface border-t border-line bg-canvas px-4 py-3'
          }
        >
          {footer}
        </div>
      )}
    </div>
  )
}
