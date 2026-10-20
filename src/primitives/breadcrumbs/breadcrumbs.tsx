import { ChevronRightIcon } from '../icons'
import type {
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbsProps,
} from './types'

const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ')

/** A semantic location trail. Page actions remain siblings, not breadcrumb items. */
export function Breadcrumbs({ className = '', ...rest }: BreadcrumbsProps) {
  return <nav aria-label="Breadcrumb" className={join('min-w-0', className)} {...rest} />
}

export function BreadcrumbList({ className = '', ...rest }: BreadcrumbListProps) {
  return (
    <ol
      className={join(
        'flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]',
        className,
      )}
      {...rest}
    />
  )
}

export function BreadcrumbItem({ className = '', ...rest }: BreadcrumbItemProps) {
  return <li className={join('inline-flex min-w-0 items-center', className)} {...rest} />
}

export function BreadcrumbLink({ className = '', ...rest }: BreadcrumbLinkProps) {
  return (
    <a
      className={join(
        'rounded-sm font-medium text-ink underline-offset-4 transition-colors',
        'hover:text-brand-fg hover:underline',
        className,
      )}
      {...rest}
    />
  )
}

export function BreadcrumbPage({ className = '', ...rest }: BreadcrumbPageProps) {
  return (
    <span
      aria-current="page"
      className={join('truncate font-medium text-ink', className)}
      {...rest}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className = '',
  ...rest
}: BreadcrumbSeparatorProps) {
  return (
    <li
      {...rest}
      role="presentation"
      aria-hidden="true"
      className={join('inline-grid shrink-0 place-items-center text-ink-soft', className)}
    >
      {children ?? <ChevronRightIcon width={12} height={12} />}
    </li>
  )
}
