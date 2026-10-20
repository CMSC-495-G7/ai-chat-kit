import type { DescriptionListProps } from './types'
export function DescriptionList({
  rows,
  className = '',
  rowClassName = 'contents',
  termClassName = 'text-[12.5px] leading-5 text-ink-soft',
  detailClassName = 'text-[13px] leading-5 font-medium text-ink-strong',
}: DescriptionListProps) {
  return (
    <dl className={className}>
      {rows.map(([term, detail]) => (
        <div key={term} className={rowClassName}>
          <dt className={termClassName}>{term}</dt>
          <dd className={detailClassName}>{detail}</dd>
        </div>
      ))}
    </dl>
  )
}
