import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { readJSON, resolveStorage, write, type StorageLike } from './safeStorage'
import type { FeatureCatalogue, FeatureFlags } from './types'

export type UseFeatureFlagsOptions<Id extends string> = {
  /** What this viewer is allowed to switch. See FeatureCatalogue. */
  catalogue: FeatureCatalogue<Id>
  /**
   * Where the choices persist. Required rather than defaulted, and no library
   * default exists on purpose: two surfaces that quietly share one key
   * overwrite each other's settings, and the bug presents as "my toggles reset
   * themselves". Scope it to the surface AND the viewer —
   * `settings:acme:u_42`, not `settings`.
   *
   * Pass `null` for a session that should not persist at all (a preview, an
   * impersonated support session).
   */
  storageKey: string | null
  /** Swap out localStorage — a server-backed preference store, or nothing at
   *  all under SSR. Failures are absorbed; see safeStorage. */
  storage?: StorageLike
}

export type FeatureFlagsValue<Id extends string> = {
  flags: FeatureFlags<Id>
  setFlag: (id: Id, on: boolean) => void
  /** Back to every feature's `defaultOn`. */
  reset: () => void
  /** Total over unknown ids, so gating code never has to null-check. */
  isOn: (id: string) => boolean
}

/**
 * A stable string describing what the catalogue *offers* — its ids and their
 * defaults, in order.
 *
 * Deriving state from this rather than from the catalogue's object identity is
 * what lets a consumer build their catalogue inline:
 *
 *     catalogue={FULL.map((s) => ({ ...s, features: s.features.filter(allowed) }))}
 *
 * That expression is a new array every render. Keyed on identity, the effect
 * below would re-run forever; keyed on content, it runs only when the offer
 * actually changes. Requiring `useMemo` at every call site would work too, and
 * would be a footgun nobody remembers until the tab locks up.
 */
function signatureOf<Id extends string>(catalogue: FeatureCatalogue<Id>): string {
  return catalogue.flatMap((s) => s.features.map((f) => `${f.id}:${f.defaultOn ?? true}`)).join('|')
}

function defaultsFor<Id extends string>(catalogue: FeatureCatalogue<Id>): FeatureFlags<Id> {
  const out = {} as FeatureFlags<Id>
  for (const section of catalogue) {
    for (const f of section.features) out[f.id] = f.defaultOn ?? true
  }
  return out
}

/**
 * Hydrates stored choices over the catalogue's defaults.
 *
 * Two rules, both load-bearing:
 *
 *  1. Stored values merge OVER defaults, so a feature shipped after someone
 *     last saved appears at its own default rather than missing.
 *
 *  2. Stored values for ids the catalogue does NOT list are dropped. That is
 *     what makes this safe for multi-tenant use: a viewer who had a feature,
 *     switched it on, and then lost it — plan downgrade, policy change, role
 *     change — must not have it come back from their own localStorage.
 *     Entitlement is decided upstream, by what goes into the catalogue.
 *
 * Non-booleans are ignored too, so a hand-edited or half-written blob falls
 * back instead of putting a switch in a third state.
 */
function hydrate<Id extends string>(
  defaults: FeatureFlags<Id>,
  storage: StorageLike | null,
  storageKey: string | null,
): FeatureFlags<Id> {
  const stored = readJSON<Partial<FeatureFlags<Id>>>(storage, storageKey)
  if (!stored) return { ...defaults }
  const next = { ...defaults }
  for (const id of Object.keys(next) as Id[]) {
    if (typeof stored[id] === 'boolean') next[id] = stored[id]
  }
  return next
}

/** Owns the on/off state for a catalogue of features, and persists it. */
export function useFeatureFlags<Id extends string>({
  catalogue,
  storageKey,
  storage,
}: UseFeatureFlagsOptions<Id>): FeatureFlagsValue<Id> {
  const store = useMemo(() => resolveStorage(storage), [storage])
  const signature = signatureOf(catalogue)

  // Kept in a ref rather than recomputed from `catalogue` on every render:
  // only the signature decides when the defaults are stale.
  const defaultsRef = useRef<FeatureFlags<Id>>(undefined as never)
  if (defaultsRef.current === undefined) defaultsRef.current = defaultsFor(catalogue)

  const [flags, setFlags] = useState<FeatureFlags<Id>>(() =>
    hydrate(defaultsRef.current, store, storageKey),
  )

  // Re-hydrate when the offer changes — entitlements that arrive after first
  // paint would otherwise leave the panel showing the pre-fetch set. Skipped
  // on mount, where useState already did it.
  const lastSignature = useRef(signature)
  useEffect(() => {
    if (lastSignature.current === signature) return
    lastSignature.current = signature
    defaultsRef.current = defaultsFor(catalogue)
    setFlags((current) => {
      const next = hydrate(defaultsRef.current, store, storageKey)
      // Anything the viewer changed this session survives, as long as the
      // feature itself did.
      for (const id of Object.keys(next) as Id[]) {
        if (id in current) next[id] = current[id]
      }
      return next
    })
    // `catalogue` is read only when `signature` says its content changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, store, storageKey])

  useEffect(() => {
    write(store, storageKey, JSON.stringify(flags))
  }, [flags, store, storageKey])

  const setFlag = useCallback((id: Id, on: boolean) => {
    setFlags((f) => (f[id] === on ? f : { ...f, [id]: on }))
  }, [])

  const reset = useCallback(() => setFlags({ ...defaultsRef.current }), [])

  const isOn = useCallback((id: string) => flags[id as Id] === true, [flags])

  return { flags, setFlag, reset, isOn }
}
