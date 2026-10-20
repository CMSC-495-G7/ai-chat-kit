export * from '../settings-dialogs/settings-state'
import { useFeatureFlags } from '../../../lib/settings'
import { DEMO_CATALOGUE } from '../settings-dialogs/settings-state'
export function useDemoComposerFeatures() {
  const { flags } = useFeatureFlags({
    catalogue: DEMO_CATALOGUE,
    storageKey: 'chat-demo-features',
  })
  return { suggestions: flags.suggestions, queue: flags.queue }
}
