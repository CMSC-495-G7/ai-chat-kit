import { IconButton } from '../../../primitives/icon-button'
import { MenuIcon } from '../../../primitives/icons'
import { ThemeToggle } from '../../../primitives/theme-toggle'

type TopBarProps = {
  onOpenSidebar: () => void
  /** Off inside the platform shell, whose account menu has the switch. */
  showThemeToggle?: boolean
}

export function TopBar({ onOpenSidebar, showThemeToggle = true }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 px-5 py-4">
      {/* lg:hidden — this control only ever exists on a touch screen, so it
          takes the 44px variant rather than the default. */}
      <IconButton
        size="lg"
        shape="rounded"
        onClick={onOpenSidebar}
        className="lg:hidden"
        aria-label="Open sidebar"
      >
        <MenuIcon />
      </IconButton>
      {showThemeToggle && (
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      )}
    </header>
  )
}
