import { Orb } from '../../../primitives/orb'
import { useBranding } from '../../engine/branding'
import type { GreetingProps } from './types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const DAY = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

/** The local calendar date as `YYYY-MM-DD`, for `<time dateTime>`. */
function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * The empty conversation's heading. A line saying who is speaking and when,
 * then a two-tone headline: the salutation in full ink, the question in the
 * softer one. Left-aligned, so it reads as the top of a page rather than a
 * splash screen.
 */
export function Greeting({
  name,
  salutation = greeting(),
  prompt = 'What are we working on?',
  compact = false,
}: GreetingProps) {
  const { appName } = useBranding()
  const today = new Date()
  const Heading = compact ? 'h2' : 'h1'

  return (
    <div className={`flex flex-col ${compact ? 'gap-2.5' : 'gap-5'}`}>
      <p
        className={`flex items-center gap-2.5 ${
          compact
            ? 'text-[11px] font-bold tracking-[0.1em] text-ink-soft uppercase'
            : 'text-[15px] text-ink-soft'
        }`}
      >
        {!compact && (
          <>
            <Orb className="orb block size-7 shrink-0 animate-orb-blink" aria-hidden />
            <span className="font-bold text-ink-strong">{appName}</span>
          </>
        )}
        <time dateTime={isoDay(today)}>{DAY.format(today)}</time>
      </p>
      <Heading
        className={`font-extrabold text-balance text-ink-strong ${
          compact
            ? 'text-[27px] leading-[1.12] tracking-[-0.02em]'
            : 'text-4xl leading-[1.08] tracking-[-0.025em] sm:text-[54px]'
        }`}
      >
        {salutation}
        {name ? `, ${name}` : ''}. <span className="block text-ink-soft">{prompt}</span>
      </Heading>
    </div>
  )
}
