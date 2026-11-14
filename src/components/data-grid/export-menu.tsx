import { useId, useState } from 'react'
import { Button } from '../../primitives/button'
import { ChevronDownIcon, DownloadIcon } from '../../primitives/icons'
import { Menu, MenuItem } from '../../primitives/menu'
import { Popover } from '../../primitives/popover'
import { RadioGroup, RadioGroupItem } from '../../primitives/radio-group'
import type { DataGridLabels, ExportFormat, ExportScope } from './types'

type Format = { id: string; label: string; hint?: string }

function normalizeFormats(formats: ExportFormat[], labels: DataGridLabels): Format[] {
  return formats.map((f) =>
    f === 'csv'
      ? { id: 'csv', label: 'CSV', hint: labels.csvHint }
      : f === 'json'
        ? { id: 'json', label: 'JSON', hint: labels.jsonHint }
        : f,
  )
}

/**
 * Export, right of the search box.
 *
 * A menu only when there is something to choose. One format and no selection
 * is a plain button that names the format, so nobody wonders what they will
 * get. Two formats, or any rows selected, open a menu: which rows (when some
 * are selected, defaulting to those), then the format, each saying what its
 * file is good for.
 */
export function ExportMenu({
  formats,
  selectedCount,
  totalCount,
  disabled,
  onExport,
  labels,
}: {
  formats: ExportFormat[]
  selectedCount: number
  totalCount: number
  disabled: boolean
  onExport: (format: string, scope: ExportScope) => void
  labels: DataGridLabels
}) {
  const scopeId = useId()
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<ExportScope>('selected')
  const list = normalizeFormats(formats, labels)
  if (list.length === 0) return null

  const hasSelection = selectedCount > 0
  const effectiveScope: ExportScope = hasSelection ? scope : 'all'
  const icon = <DownloadIcon width={15} height={15} />

  if (list.length === 1 && !hasSelection) {
    return (
      <Button
        size="lg"
        icon={icon}
        disabled={disabled}
        onClick={() => onExport(list[0].id, 'all')}
        className="shrink-0"
      >
        {labels.exportAs(list[0].label)}
      </Button>
    )
  }

  return (
    <>
      <Button
        ref={setAnchor}
        size="lg"
        icon={icon}
        trailingIcon={<ChevronDownIcon width={13} height={13} />}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          setScope('selected')
          setOpen((v) => !v)
        }}
        className="shrink-0"
      >
        {labels.export}
      </Button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label={labels.export}
        width={264}
        align="end"
      >
        {hasSelection && (
          <div className="flex flex-col border-b border-line px-1 pb-2">
            <span
              id={`${scopeId}-label`}
              className="px-2.5 pt-1.5 pb-1 text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase"
            >
              {labels.exportRows}
            </span>
            <RadioGroup
              name={scopeId}
              aria-labelledby={`${scopeId}-label`}
              value={scope}
              onValueChange={(v) => setScope(v as ExportScope)}
              className="gap-0.5"
            >
              {(
                [
                  ['selected', labels.exportSelected, selectedCount],
                  ['all', labels.exportAll, totalCount],
                ] as const
              ).map(([value, label, count]) => (
                <label
                  key={value}
                  className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-control px-2.5 text-[13px] text-ink hover:bg-tint/5"
                >
                  <RadioGroupItem value={value} />
                  <span className="grow">{label}</span>
                  <span className="text-[12px] text-ink-soft tabular-nums">
                    {count.toLocaleString()}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}
        <Menu aria-label={labels.export} className={hasSelection ? 'pt-1.5' : ''}>
          {list.map((f) => (
            <MenuItem
              key={f.id}
              label={f.label}
              hint={f.hint}
              icon={
                <span className="inline-grid size-7 place-items-center rounded-control bg-chip text-[10px] font-extrabold text-chip-fg">
                  {f.id === 'json' ? '{ }' : f.label.slice(0, 4).toUpperCase()}
                </span>
              }
              onSelect={() => {
                setOpen(false)
                onExport(f.id, effectiveScope)
              }}
            />
          ))}
        </Menu>
      </Popover>
    </>
  )
}
