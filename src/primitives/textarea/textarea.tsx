import type { TextareaProps } from './types'

export function Textarea({ className = '', rows = 4, ref, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[
        'min-h-24 w-full resize-y rounded-control border border-line bg-panel-solid px-3 py-2',
        'text-[13px] leading-relaxed text-ink outline-none transition placeholder:text-ink-soft',
        'hover:border-ink-soft/40 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20',
        'read-only:bg-tint/5 disabled:pointer-events-none disabled:resize-none disabled:opacity-40',
        'aria-invalid:border-danger aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-danger/15',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  )
}
