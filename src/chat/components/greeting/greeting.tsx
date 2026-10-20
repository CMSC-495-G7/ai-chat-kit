import { Orb } from '../../../primitives/orb'
import type { GreetingProps } from './types'
function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Greeting({ name, salutation = greeting() }: GreetingProps) {
  return (
    <div className="flex flex-col items-center">
      <Orb className="orb block size-16 rounded-full animate-orb-drift" aria-hidden />

      <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-ink-strong sm:text-5xl">
        {salutation}, {name}
      </h1>
      <p className="mt-3 text-lg text-ink-soft">How can I help you today?</p>
    </div>
  )
}
