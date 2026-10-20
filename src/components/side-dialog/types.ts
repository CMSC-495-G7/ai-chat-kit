import type { ReactNode } from 'react'
export type SideDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  closeLabel?: string
  /** Preferred panel width, capped to the viewport. CSS length or pixels. */
  width?: string | number
  className?: string
}
