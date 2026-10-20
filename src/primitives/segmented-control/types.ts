import type { ReactNode } from 'react'
export type SegmentedControlProps = {
  label: string
  value: string
  options: { value: string; label: ReactNode; disabled?: boolean }[]
  onValueChange: (value: string) => void
  className?: string
}
