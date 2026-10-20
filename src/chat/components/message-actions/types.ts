import type { ReactNode } from 'react'

export type MessageActionsProps = {
  children: ReactNode
  /**
   * Hidden until the turn is hovered or something inside takes focus. The
   * turn must carry `group/turn` for that to work — see the component.
   *
   * Off for a row that is always on, which is what a finished answer wants.
   */
  reveal?: boolean
  className?: string
}
