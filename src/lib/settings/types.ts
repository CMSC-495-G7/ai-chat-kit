/**
 * One switchable feature, as a tenant's settings surface would describe it.
 *
 * `label` and `hint` are content, not code: they are rendered verbatim, so a
 * tenant that calls reasoning "Show the model's working" says so here rather
 * than forking the component.
 */
export type FeatureDescriptor<Id extends string = string> = {
  id: Id
  label: string
  /** One line under the label. Optional — a self-evident switch needs none. */
  hint?: string
  /** Where this feature starts for someone who has never touched the setting. */
  defaultOn?: boolean
  /**
   * Present but not changeable — the row renders greyed with `lockedReason`
   * beside it. This is for "your plan does not include this", NOT for "this
   * tenant does not have this": a feature the tenant does not have is left out
   * of the catalogue entirely, so it neither renders nor gates (see
   * useFeatureFlags).
   */
  locked?: boolean
  lockedReason?: string
}

/**
 * A group of switches under one heading. The demo groups by where a feature
 * lands in a streamed turn; a product might group by "Conversation" /
 * "Privacy" / "Advanced". Either way it is data, so the panel is one loop.
 */
export type FeatureSection<Id extends string = string> = {
  id: string
  title: string
  /** One line under the heading, explaining what the group is for. */
  description?: string
  features: FeatureDescriptor<Id>[]
}

/**
 * The whole switchable surface for ONE viewer — already narrowed to what their
 * tenant and plan allow. Nothing downstream re-checks entitlement: if it is in
 * here the viewer may see it, and if it is not, it does not exist.
 */
export type FeatureCatalogue<Id extends string = string> = FeatureSection<Id>[]

/** Every id in the catalogue, mapped to whether it is currently on. */
export type FeatureFlags<Id extends string = string> = Record<Id, boolean>
