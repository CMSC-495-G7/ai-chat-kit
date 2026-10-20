import type { DialogHTMLAttributes, ReactNode, RefObject } from 'react'

export type ModalSize = 'sm' | 'md' | 'lg'
export type ModalIconTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger'

export type ModalProps = Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  'open' | 'title' | 'onCancel' | 'onClose' | 'children'
> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  /** Actions rendered in a separated footer. Compose them from `Button`. */
  footer?: ReactNode
  size?: ModalSize
  /** Optional identity or status glyph shown beside the heading. */
  icon?: ReactNode
  iconTone?: ModalIconTone
  showCloseButton?: boolean
  closeLabel?: string
  /** Adds an expand/restore control beside close. Expanded dialogs occupy 80% of the viewport. */
  expandable?: boolean
  expandLabel?: string
  restoreLabel?: string
  dismissOnBackdrop?: boolean
  dismissOnEscape?: boolean
  /** Optional element to focus after the dialog enters the top layer. */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Styles the opaque dialog surface without changing the top-layer wrapper. */
  contentClassName?: string
}
