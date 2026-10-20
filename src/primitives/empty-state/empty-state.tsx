import type { EmptyStateProps } from './types'
/** An empty body with optional copy. Arrangement stays with the host. */
export function EmptyState({
  title,
  body,
  titleClassName = '',
  bodyClassName = '',
  children,
  ...rest
}: EmptyStateProps) {
  return (
    <div {...rest}>
      {title && <h1 className={titleClassName}>{title}</h1>}
      {body && <p className={bodyClassName}>{body}</p>}
      {children}
    </div>
  )
}
