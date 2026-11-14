/**
 * The look of one radio button. `RadioGroupItem` uses it, and so does anything
 * that needs a lone radio outside a group, like a table's pick-one column, so
 * every radio in the library is the same circle.
 */
export const RADIO_CLASS = [
  'size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-ink-soft/60 bg-panel-solid transition',
  'hover:border-brand-fg/70 checked:border-[5px] checked:border-brand-solid',
  'focus-visible:ring-3 focus-visible:ring-accent/20',
  'disabled:cursor-not-allowed disabled:opacity-40',
  'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15',
].join(' ')
