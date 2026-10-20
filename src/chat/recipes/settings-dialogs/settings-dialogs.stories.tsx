import type { Meta, StoryObj } from '@storybook/react-vite'
import { DemoFeaturesProvider, useDemoFeatureState } from '../shared/demoFeatures'
import { FeatureTogglesModal } from './feature-toggles-modal'
import { UserSettingsModal } from './user-settings-modal'
function Settings({ kind = 'user' }: { kind?: 'user' | 'features' }) {
  const value = useDemoFeatureState()
  return (
    <DemoFeaturesProvider value={value}>
      {kind === 'user' ? (
        <UserSettingsModal open onClose={() => {}} />
      ) : (
        <FeatureTogglesModal open onClose={() => {}} />
      )}
    </DemoFeaturesProvider>
  )
}
const meta = { title: 'Chat/Recipes/Settings dialogs', component: Settings } satisfies Meta<
  typeof Settings
>
export default meta
type Story = StoryObj<typeof meta>
export const User: Story = {}
export const Features: Story = { args: { kind: 'features' } }
