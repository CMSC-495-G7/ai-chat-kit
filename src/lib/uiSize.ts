import { createContext, useContext } from 'react'

/**
 * Density of the chat UI. The full-page app runs at 'default'; the embedded
 * widget wraps its tree in <UiSizeProvider value="compact"> to shrink fonts,
 * paddings, and controls without changing any component call sites.
 */
export type UiSize = 'default' | 'compact'

const UiSizeContext = createContext<UiSize>('default')

export const UiSizeProvider = UiSizeContext.Provider

export function useUiSize(): UiSize {
  return useContext(UiSizeContext)
}
