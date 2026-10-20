import type { StepperProps } from './types'
export function Stepper({ steps, current, label = 'Steps', className = '' }: StepperProps) {
  return (
    <ol
      aria-label={label}
      className={`flex w-48 shrink-0 flex-col self-start border-l-2 border-line max-lg:w-full max-lg:flex-row max-lg:border-l-0 ${className}`}
    >
      {steps.map((label, index) => (
        <li
          key={label}
          aria-current={index === current ? 'step' : undefined}
          className={`-ml-0.5 flex h-9 items-center border-l-2 pl-4 text-sm max-lg:ml-0 max-lg:border-l-0 max-lg:pr-4 max-lg:pl-0 ${index === current ? 'border-brand-solid font-bold text-ink-strong' : 'border-transparent font-medium text-ink-soft'}`}
        >
          {label}
        </li>
      ))}
    </ol>
  )
}
