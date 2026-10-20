import type { IconProps } from './types'

function base(props: IconProps): IconProps {
  return {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }
}

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MicIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
)

export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
  </svg>
)

export const StopIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" stroke="none" />
  </svg>
)

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const LibraryIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 19.5V5a1 1 0 0 1 1-1h3v16.5M12 4h3a1 1 0 0 1 1 1v14.5" />
    <path d="m18.5 5.5 2 14" />
  </svg>
)

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 9.5V21h14V9.5M9 21v-7h6v7" />
  </svg>
)

export const ChatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12a8 8 0 0 1-8 8H4l1.6-3.2A8 8 0 1 1 21 12Z" />
  </svg>
)

export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m3 17 5-4 4 3 4-4 5 5" />
  </svg>
)

export const SparkleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
)

export const SummarizeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 10h16M4 14h10M4 18h7" />
  </svg>
)

export const BulbIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3Z" />
  </svg>
)

export const CircleInfoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

export const CircleCheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
)

export const TriangleAlertIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 16h.01" />
  </svg>
)

export const CircleXIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </svg>
)

export const PlanIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 4h8M6 8h12M4 12h16v8H4z" />
    <path d="M8 16h4" />
  </svg>
)

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const ChevronUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m18 15-6-6-6 6" />
  </svg>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)

export const ExternalLinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
)

export const FunnelIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h16l-6.5 7.5V19l-3 1.5v-8L4 5Z" />
  </svg>
)

/** Three tracks with offset handles — "adjust these", not "app preferences". */
export const SlidersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h6M14 7h6M4 12h12M4 17h3M11 17h9" />
    <circle cx="12" cy="7" r="2" />
    <circle cx="18" cy="12" r="2" />
    <circle cx="9" cy="17" r="2" />
  </svg>
)

export const HistoryIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4.5V9H8" />
    <path d="M12 8v4.5l3 2" />
  </svg>
)

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 13A8 8 0 1 1 11 4a6.5 6.5 0 0 0 9 9Z" />
  </svg>
)

export const CopyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const RefreshIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 11a8 8 0 1 0-.5 4M20 4v7h-7" />
  </svg>
)

export const FormatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h10M4 12h7M4 17h10" />
    <path d="m17 10 1.2 2.3 2.8 1.2-2.8 1.2L17 17l-1.2-2.3-2.8-1.2 2.8-1.2L17 10Z" />
  </svg>
)

export const ThumbUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-7a2.4 2.4 0 0 1 2.5 2.5L13 10h6a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 18 20H7" />
  </svg>
)

export const ThumbDownIcon = (p: IconProps) => (
  <svg {...base(p)} style={{ transform: 'rotate(180deg)', ...p.style }}>
    <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-7a2.4 2.4 0 0 1 2.5 2.5L13 10h6a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 18 20H7" />
  </svg>
)

export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const PaperclipIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m21 11.5-8.8 8.8a5.5 5.5 0 0 1-7.8-7.8L13.2 3.7a3.7 3.7 0 0 1 5.2 5.2l-8.8 8.8a1.8 1.8 0 0 1-2.6-2.6L15.3 6.8" />
  </svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

export const ExpandVerticalIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
  </svg>
)

export const CollapseVerticalIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5l4 4 4-4M8 19l4-4 4 4" />
  </svg>
)

export const MinusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
)

export const ExpandDiagonalIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
  </svg>
)

export const CollapseDiagonalIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 10h-6V4M21 3l-7 7M4 14h6v6M3 21l7-7" />
  </svg>
)

/* A window lifted off the page it came from: open this in a dialog. Not
   ExternalLinkIcon, which leaves the app, nor ExpandDiagonalIcon, which
   resizes what is already open. */
export const PopOutIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7.5 19H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2.5" />
    <rect x="10.5" y="11.5" width="10.5" height="9" rx="1.5" />
  </svg>
)

/* --- Queue dock ----------------------------------------------------------
   The send queue's own glyphs. QueueIcon is a list with a plus on it: the
   plus is the verb — add this to a list — and it is what stops the glyph
   being read as MenuIcon, which three bare lines always were. */

export const QueueIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6.5h9M4 12h9M4 17.5h6" />
    <path d="M17.5 13.5v7M14 17h7" />
  </svg>
)

/**
 * The composer's primary action while an answer runs: pressing it queues.
 *
 * SendIcon's arrow with QueueIcon's plus, and neither alone would do. A plain
 * arrow promises the answer starts now, which is the one thing this button
 * does not do; QueueIcon here put the mode's own glyph on the button beside
 * it, twice over, a hairline apart.
 */
export const SendToQueueIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10.5 19.5V6M5 11.5 10.5 6l5.5 5.5" />
    <path d="M18.5 15.5v5M16 18h5" />
  </svg>
)

export const PauseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 5v14M15 5v14" />
  </svg>
)

export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5.5 19 12 8 18.5Z" />
  </svg>
)

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
)

export const PencilIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15.5 4.5 19.5 8.5M4 20h4L20.1 7.9a2.8 2.8 0 0 0-4-4L4 16z" />
  </svg>
)

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15M10 6.5V3.5h4v3M6.5 6.5 7.5 20.5h9l1-14" />
  </svg>
)

/** Dots are a mark, not a stroke — filled so they read at 13px. */
export const DotsIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
  </svg>
)

/** Drag handle. Filled for the same reason as DotsIcon. */
export const GripIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
)

export const ArrowToTopIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20V9M7.5 13.5 12 9l4.5 4.5M5 5h14" />
  </svg>
)

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V7M7.5 11.5 12 7l4.5 4.5" />
  </svg>
)

export const ArrowDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v12M7.5 12.5 12 17l4.5-4.5" />
  </svg>
)

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h12M12.5 7.5 17 12l-4.5 4.5" />
  </svg>
)

/** Two turns folded into one. */
export const UndoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 14.5 4.5 10 9 5.5M4.5 10h9a5.5 5.5 0 0 1 0 11h-2.5" />
  </svg>
)

/** A person — the account, as distinct from SlidersIcon's settings. */
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
)

/** A push pin, for docking a floating panel. Toggle state is carried by the
 *  button's `aria-pressed` and colour, not by a second glyph — a pin that
 *  becomes a crossed-out pin makes the reader decode which state they are
 *  looking at rather than which state they would get. */
export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 4h6l-1 5 3.5 3.5H6.5L10 9 9 4Z" />
    <path d="M12 12.5V20" />
  </svg>
)

/** A calendar page. Paired with a native date input, never replacing one. */
export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8.5 3v4M15.5 3v4" />
  </svg>
)

/** A stacked envelope — messages, an inbox, a mail-backed item. */
export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="8" width="15" height="11" rx="2" />
    <path d="m3.5 10 7.5 4.5 7.5-4.5" />
    <path d="M7 5h11.5a2 2 0 0 1 2 2v8" />
  </svg>
)

// ── Platform shell: the bar, the menu and the spaces ─────────────────────────

export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)

export const WorkflowIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="7" height="6" rx="1.5" />
    <rect x="14" y="14" width="7" height="6" rx="1.5" />
    <path d="M10 7h4a3 3 0 0 1 3 3v4" />
  </svg>
)

export const InsightsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 20V10M12 20V4M19 20v-7" />
  </svg>
)

export const IngestionIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v10M8 10l4 4 4-4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
)

export const TasksIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
)

export const SideMenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M9.5 4.5v15" />
  </svg>
)

export const PlugIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0z" />
    <path d="M12 16v5" />
  </svg>
)

export const BuildingIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V6.5L12 3l8 3.5V20" />
    <path d="M4 20h16M9.5 20v-4.5h5V20" />
  </svg>
)
