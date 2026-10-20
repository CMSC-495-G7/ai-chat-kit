import { FeatureToggles } from '../../../components/settings'
import { SideDialog } from '../../../components/side-dialog'
import { DEMO_CATALOGUE, useDemoFeatures } from './settings-state'

/**
 * The demo's feature-toggle shell — and nothing but a shell.
 *
 * Everything inside it comes from `components/settings`, driven by the
 * catalogue in demoFeatures.ts. That split is the point: the dialog, its
 * anchoring, the title and the reset footer are this app's opinions, while the
 * switch list is the library's. The two appearance pickers are the library's
 * too, but they are a viewer preference rather than presenter chrome, so they
 * sit in UserSettingsModal — which is exactly the regrouping a product does
 * when it drops these components into its own account settings.
 *
 * Anchored right rather than centred, with a light unblurred scrim: a centred
 * dialog would hide the very conversation these switches change. It is still a
 * true modal — a native <dialog> in the top layer, so focus trapping, Esc, and
 * inertness of the page behind it come from the platform.
 */
export function FeatureTogglesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { flags, setFlag, reset } = useDemoFeatures()

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title="Feature toggles"
      description="Choose what a response shows. Saved on this device."
      footer={
        <>
          <button
            type="button"
            onClick={reset}
            className="rounded-control px-2 py-1 text-[13px] font-medium text-ink-soft transition hover:text-ink-strong"
          >
            Reset to defaults
          </button>
        </>
      }
    >
      <FeatureToggles catalogue={DEMO_CATALOGUE} flags={flags} onChange={setFlag} />
    </SideDialog>
  )
}
