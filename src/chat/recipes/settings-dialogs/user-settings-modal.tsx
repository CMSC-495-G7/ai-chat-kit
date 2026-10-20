import { HighlightPicker, PalettePicker } from '../../../components/settings'
import { SideDialog } from '../../../components/side-dialog'
import { DEMO_USER } from '../../../fixtures/platform/user'
import { DEMO_PALETTES } from '../../../fixtures/palettes'
import { SHIPPED_HIGHLIGHTS } from '../../../lib/settings/appearance'
import { Avatar } from '../../../primitives/avatar'
import { DEMO_APPEARANCE, useDemoFeatures } from './settings-state'

/**
 * The account dialog behind the sidebar avatar's "User settings".
 *
 * It is the other half of the split the library's settings components were
 * written for: the two pickers are a *viewer's* preferences, so they belong
 * here beside the profile, while FeatureTogglesModal keeps the switches that
 * decide what a response is allowed to render. Both dialogs are this app's
 * shell around `components/settings`; neither owns a control.
 *
 * Same anchoring as the other dialog — right, unblurred scrim — because both
 * change the conversation you are looking at, and a centred card would cover
 * the evidence.
 */
export function UserSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { highlight, setHighlight, palette, setPalette, resetAppearance } = useDemoFeatures()

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title="User settings"
      description="Your profile and how the chat looks. Saved on this device."
      footer={
        <>
          <button
            type="button"
            onClick={resetAppearance}
            className="rounded-control px-2 py-1 text-[13px] font-medium text-ink-soft transition hover:text-ink-strong"
          >
            Reset appearance
          </button>
        </>
      }
    >
      {/* Read-only: this demo has no account backend, and a form that
              silently discarded an edit would be a worse lie than plain text. */}
      <div className="flex items-center gap-3 rounded-surface bg-panel-solid px-4 py-3 ring-1 ring-line">
        <Avatar variant="text" text={DEMO_USER.initials} size={40} tone="brand" aria-hidden />
        {/* The plan sits under the name rather than beside it: on the
                narrow card an email and a pill fighting for one row left the
                address truncated, and the address is the identifying half. */}
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-ink-strong">{DEMO_USER.name}</span>
            <span className="shrink-0 text-[11px] font-semibold text-accent">{DEMO_USER.plan}</span>
          </div>
          <div className="mt-0.5 truncate text-[13px] text-ink-soft">{DEMO_USER.email}</div>
        </div>
      </div>

      {DEMO_APPEARANCE.palette.show && (
        <PalettePicker
          options={DEMO_PALETTES}
          value={palette}
          onChange={setPalette}
          title={DEMO_APPEARANCE.palette.title}
          description={DEMO_APPEARANCE.palette.description}
        />
      )}

      {DEMO_APPEARANCE.highlight.show && (
        <HighlightPicker
          options={SHIPPED_HIGHLIGHTS}
          value={highlight}
          onChange={setHighlight}
          title={DEMO_APPEARANCE.highlight.title}
          description={DEMO_APPEARANCE.highlight.description}
        />
      )}
    </SideDialog>
  )
}
