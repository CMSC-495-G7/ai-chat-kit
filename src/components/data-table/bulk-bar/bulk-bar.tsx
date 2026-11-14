import type { ReactNode } from 'react'
import { Button } from '../../../primitives/button'

/**
 * The bar that appears once rows are selected.
 *
 * It replaces nothing and pushes the table down rather than floating over it.
 * A bar that overlays the first row hides the thing you just selected, and on
 * a short result set that is most of what is on screen.
 *
 * The count is the first thing in it because "apply to 2" and "apply to 1,284"
 * are different decisions, and a select-all that quietly spanned every page is
 * exactly where destructive bulk actions go wrong.
 */
export function BulkBar({
  onClear,
  clearLabel,
  countLabel,
  children,
}: {
  onClear: () => void
  clearLabel: string
  countLabel: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-control bg-brand-solid px-3.5 py-2">
      <span aria-live="polite" className="text-[13px] font-extrabold text-on-brand-solid">
        {countLabel}
      </span>
      <span aria-hidden="true" className="h-4 w-px bg-on-brand-solid/28" />
      {children}
      <span className="grow" />
      <Button variant="inverse" size="sm" onClick={onClear}>
        {clearLabel}
      </Button>
    </div>
  )
}
