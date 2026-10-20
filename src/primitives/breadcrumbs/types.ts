import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  Ref,
} from 'react'

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }
export type BreadcrumbListProps = OlHTMLAttributes<HTMLOListElement> & {
  ref?: Ref<HTMLOListElement>
}
export type BreadcrumbItemProps = LiHTMLAttributes<HTMLLIElement> & { ref?: Ref<HTMLLIElement> }
export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLAnchorElement>
}
export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement> & { ref?: Ref<HTMLSpanElement> }
export type BreadcrumbSeparatorProps = LiHTMLAttributes<HTMLLIElement> & {
  ref?: Ref<HTMLLIElement>
}
