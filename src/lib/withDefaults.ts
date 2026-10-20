/** Treat an undefined optional override like an omitted prop. */
export function withDefaults<T extends object>(defaults: T, overrides?: Partial<NoInfer<T>>): T {
  const next = { ...defaults }
  for (const key of Object.keys(overrides ?? {}) as (keyof T)[]) {
    const value = overrides?.[key]
    if (value !== undefined) next[key] = value
  }
  return next
}
