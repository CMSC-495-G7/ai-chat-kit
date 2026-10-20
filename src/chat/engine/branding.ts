import { createContext, useContext } from 'react'

/** Product name and boilerplate copy the chat UI renders. Injected by the host
 *  so the library carries no baked-in brand. */
export type Branding = {
  appName: string
  modelName: string
  disclaimer: string
}

/** Neutral fallback used when no BrandingProvider is present. */
export const defaultBranding: Branding = {
  appName: 'Assistant',
  modelName: 'Assistant',
  disclaimer: 'AI can make mistakes. Verify important details.',
}

const BrandingContext = createContext<Branding>(defaultBranding)

export const BrandingProvider = BrandingContext.Provider

export function useBranding(): Branding {
  return useContext(BrandingContext)
}
