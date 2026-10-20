import { SearchIcon } from '../icons'
import type { SearchFieldProps } from './types'
export function SearchField({
  label,
  fieldSize = 'lg',
  containerClassName = '',
  className = '',
  ...rest
}: SearchFieldProps) {
  const height = { sm: 'h-8', md: 'h-9', lg: 'h-11' }[fieldSize]
  return (
    <label
      className={`flex ${height} min-w-0 shrink-0 items-center gap-2 rounded-control bg-tint/5 px-3 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-(--focus-ring) ${containerClassName}`}
    >
      <SearchIcon width={16} height={16} className="shrink-0 text-ink-soft" />
      <span className="sr-only">{label}</span>
      <input
        type="text"
        className={`h-full min-w-0 flex-1 bg-transparent text-sm text-ink-strong outline-none placeholder:text-ink-soft ${className}`}
        {...rest}
      />
    </label>
  )
}
