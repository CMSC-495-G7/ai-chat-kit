export type GreetingProps = {
  /** Who is being greeted. Without it the salutation stands alone: "Good morning." */
  name?: string
  /** "Good morning". Left unset, it follows the clock. */
  salutation?: string
  /** The headline's second, softer line. */
  prompt?: string
  /**
   * The widget's version: the date alone above the headline, at panel size,
   * as an `h2` — the panel header already shows the mark and the app name,
   * and the host page owns the `h1`.
   */
  compact?: boolean
}
