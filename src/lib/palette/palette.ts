import { contrastRatio, hexToOklch, oklchToHex, withAlpha, type Oklch } from './color'
import type { PaletteOption } from '../settings/appearance'

/**
 * Custom palettes, built at runtime from a few seed colours.
 *
 * brand/brand.css ships a handful of hand-tuned `chat-theme-*` classes. This
 * is the other way in: hand `createPalette` a brand colour (and optionally an
 * accent, a warm note and a danger hue) and it returns the same tier-1
 * variables a theme block declares — the ramps and the light/dark surfaces.
 * Everything in brand.css §1/§2 derives from those, so light and dark both
 * follow without a stylesheet edit.
 *
 * The ramps share one lightness table, taken from the default theme's blue.
 * Lightness is what the contrast ratios hang on, so a palette built here
 * lands near the default's ratios whatever its hue. Near is not a guarantee:
 * run `checkPalette` on anything a tenant supplies.
 */

export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type RampStep = (typeof RAMP_STEPS)[number]

/** The class a custom palette scope carries. brand.css §1/§2 match any
 *  `chat-theme-*` class, so this one needs no CSS block of its own. */
export const CUSTOM_THEME_CLASS = 'chat-theme-custom'

export type PaletteInput = {
  /** The identity colour, as hex. Solid fills, the user bubble, links, chips. */
  brand: string
  /** The action hue: focus rings, accent text, selection. Defaults to `brand`,
   *  which is how every shipped theme runs — one hue. */
  accent?: string
  /**
   * The warm note: the orb's blooms, the dark-mode send button and the
   * highlight default. Defaults to the shipped ember orange. Pass your brand
   * colour for a single-hue palette with no orange anywhere.
   */
  warm?: string
  /** Error states. Defaults to the shipped red. */
  danger?: string
  /** `tinted` (default) carries the brand hue into the dark canvas, like the
   *  navy themes. `neutral` drops it to near-grey, like Graphite. */
  surfaces?: 'tinted' | 'neutral'
  /**
   * Which ramp step the seed colours sit on. `auto` (default) picks the step
   * whose lightness is nearest the seed, which keeps the contrast ratios. A
   * fixed step puts the exact seed there — `600` for "our primary button is
   * exactly this colour" — at the cost of whatever ratios that colour has.
   */
  anchor?: 'auto' | RampStep
  /** Body font stack. Defaults to the shipped Nunito Sans. */
  font?: string
  /** Display (heading) font stack. Defaults to `font`. */
  displayFont?: string
  /** Any CSS variable, set last — `{ '--notify': '#b91c1c' }`. The leading
   *  `--` is optional. For the rare token the seeds don't reach. */
  overrides?: Record<string, string>
}

/** CSS custom properties, ready for `element.style.setProperty` or a React
 *  `style` prop. */
export type PaletteVars = Record<`--${string}`, string>

// The default theme's blue ramp in OKLCH: lightness per step, and chroma as a
// share of the 600 step's. See the comment at the top.
const LIGHTNESS: Record<RampStep, number> = {
  50: 0.965,
  100: 0.92,
  200: 0.831,
  300: 0.727,
  400: 0.586,
  500: 0.505,
  600: 0.423,
  700: 0.372,
  800: 0.323,
  900: 0.284,
  950: 0.21,
}
const CHROMA: Record<RampStep, number> = {
  50: 0.08,
  100: 0.18,
  200: 0.38,
  300: 0.62,
  400: 0.91,
  500: 0.94,
  600: 1,
  700: 0.87,
  800: 0.73,
  900: 0.61,
  950: 0.42,
}
// How far each step follows the seed's own lightness. The ends stay put, so
// the 50 is always a near-white wash and the 950 always a near-black.
const FOLLOW: Record<RampStep, number> = {
  50: 0,
  100: 0.15,
  200: 0.4,
  300: 0.7,
  400: 0.9,
  500: 1,
  600: 1,
  700: 1,
  800: 0.85,
  900: 0.6,
  950: 0.3,
}

function nearestStep(l: number): RampStep {
  return RAMP_STEPS.reduce((best, s) =>
    Math.abs(LIGHTNESS[s] - l) < Math.abs(LIGHTNESS[best] - l) ? s : best,
  )
}

/** An 11-step ramp through one seed colour, as hex. */
export function buildRamp(seed: string, anchor: 'auto' | RampStep = 'auto') {
  const s = hexToOklch(seed)
  const at = anchor === 'auto' ? nearestStep(s.l) : anchor
  const shift = s.l - LIGHTNESS[at]
  const ramp = {} as Record<RampStep, string>
  let prev = 1
  for (const step of RAMP_STEPS) {
    if (step === at) {
      ramp[step] = seed.toLowerCase()
      prev = s.l
      continue
    }
    // Monotonic: a large shift must not push one step past its neighbour.
    const l = Math.min(prev - 0.015, Math.max(0.12, LIGHTNESS[step] + shift * FOLLOW[step]))
    const c = s.c * (CHROMA[step] / CHROMA[at])
    ramp[step] = oklchToHex({ l, c, h: s.h })
    prev = l
  }
  return ramp
}

// The warm and danger ramps are short, and each step is pinned to the shipped
// lightness rather than following the seed: brand.css pairs them with fixed
// glyph colours (--on-action is a near-black brown on ember-500, white sits on
// danger-600), so their lightness is what keeps those pairs legible.
function pinnedRamp<S extends number>(seed: string, steps: Record<S, Oklch>) {
  const s = hexToOklch(seed)
  const out = {} as Record<S, string>
  for (const [step, ref] of Object.entries(steps) as [string, Oklch][]) {
    out[Number(step) as S] = oklchToHex({ l: ref.l, c: Math.max(s.c, ref.c * 0.4), h: s.h })
  }
  return out
}
const EMBER: Record<300 | 500 | 600, Oklch> = {
  300: { l: 0.825, c: 0.115, h: 56 },
  500: { l: 0.677, c: 0.186, h: 47 },
  600: { l: 0.553, c: 0.174, h: 38 },
}
const DANGER: Record<300 | 400 | 500 | 600 | 700, Oklch> = {
  300: { l: 0.808, c: 0.114, h: 20 },
  400: { l: 0.704, c: 0.191, h: 22 },
  500: { l: 0.637, c: 0.237, h: 25 },
  600: { l: 0.577, c: 0.245, h: 27 },
  700: { l: 0.505, c: 0.213, h: 28 },
}

/** The shipped ember steps, so an omitted `warm` matches the default theme
 *  exactly rather than a rebuilt approximation of it. */
const SHIPPED_EMBER = { 300: '#ffb27a', 500: '#ef6a00', 600: '#c2410c' }

/** Neutral surfaces carrying a trace of the brand hue — the same lightness as
 *  the default theme's, with chroma capped so a vivid brand stays a tint. */
function surfaces(brand: Oklch, mode: 'tinted' | 'neutral'): PaletteVars {
  const tone = (l: number, max: number) =>
    oklchToHex({ l, c: Math.min(brand.c * (max / 0.139), max), h: brand.h })
  const darkCanvas = mode === 'neutral' ? tone(0.18, 0.006) : tone(0.2, 0.046)
  const darkPanel = mode === 'neutral' ? tone(0.215, 0.006) : tone(0.257, 0.062)
  return {
    '--canvas-light': tone(0.975, 0.004),
    '--panel-light': 'rgba(255, 255, 255, 0.62)',
    '--panel-solid-light': '#ffffff',
    '--ink-strong-light': tone(0.268, 0.027),
    '--ink-light': tone(0.338, 0.024),
    '--ink-soft-light': tone(0.53, 0.025),
    '--canvas-dark': darkCanvas,
    '--panel-dark': withAlpha(darkPanel, 0.6),
    '--panel-solid-dark': darkPanel,
    '--ink-strong-dark': tone(0.971, 0.007),
    '--ink-dark': tone(0.927, 0.014),
    '--ink-soft-dark': tone(0.72, 0.024),
  }
}

/**
 * Moves `hex` darker (or lighter) along its own hue until it clears `min`
 * against `bg`. The lightness table gets most hues there on its own, but at
 * the same OKLCH lightness a green or a cyan is brighter to WCAG's formula
 * than a blue, and lands a few hundredths short.
 */
function ensureContrast(hex: string, bg: string, min: number, direction: 'darker' | 'lighter') {
  const c = hexToOklch(hex)
  let out = hex
  for (let l = c.l; contrastRatio(out, bg) < min && l > 0.05 && l < 0.99;) {
    l += direction === 'darker' ? -0.01 : 0.01
    out = oklchToHex({ ...c, l })
  }
  return out
}

/** The ramp steps brand.css sets as text or behind a white glyph, nudged until
 *  they clear their bar. The anchored step is the caller's exact colour and is
 *  never moved; `checkPalette` reports it instead. */
function guard(
  ramp: Record<RampStep, string>,
  pinned: RampStep | null,
  canvasLight: string,
  panelDark: string,
) {
  const out = { ...ramp }
  const fix = (step: RampStep, bg: string, min: number, dir: 'darker' | 'lighter') => {
    if (step !== pinned) out[step] = ensureContrast(out[step], bg, min, dir)
  }
  fix(500, canvasLight, 4.5, 'darker')
  fix(600, '#ffffff', 4.5, 'darker')
  fix(700, canvasLight, 4.5, 'darker')
  fix(300, panelDark, 4.5, 'lighter')
  return out
}

/** Every tier-1 variable a theme declares, from a few seed colours. */
export function createPalette(input: PaletteInput): PaletteVars {
  const anchor = input.anchor ?? 'auto'
  const brandSeed = hexToOklch(input.brand)
  const pinned = (seed: string) => (anchor === 'auto' ? nearestStep(hexToOklch(seed).l) : anchor)
  const surface = surfaces(brandSeed, input.surfaces ?? 'tinted')
  const bgs = [surface['--canvas-light'], surface['--panel-solid-dark']] as const
  const brand = guard(buildRamp(input.brand, anchor), pinned(input.brand), ...bgs)
  const accent = input.accent
    ? guard(buildRamp(input.accent, anchor), pinned(input.accent), ...bgs)
    : brand
  const vars: PaletteVars = {}

  for (const step of RAMP_STEPS) vars[`--brand-${step}`] = brand[step]
  for (const step of [200, 300, 400, 500, 600, 700] as const)
    vars[`--accent-${step}`] = accent[step]

  const ember = input.warm ? pinnedRamp(input.warm, EMBER) : SHIPPED_EMBER
  for (const [step, hex] of Object.entries(ember)) vars[`--ember-${step}`] = hex
  if (input.danger) {
    for (const [step, hex] of Object.entries(pinnedRamp(input.danger, DANGER)))
      vars[`--danger-${step}`] = hex
  }

  Object.assign(vars, surface)

  if (input.font) vars['--font-brand-family'] = input.font
  if (input.displayFont) vars['--font-display-family'] = input.displayFont
  for (const [name, value] of Object.entries(input.overrides ?? {}))
    vars[(name.startsWith('--') ? name : `--${name}`) as `--${string}`] = value
  return vars
}

/**
 * The palette as a CSS rule, for a stylesheet or a `<style>` in the document
 * head. That is the way to avoid a flash of the default palette on load: the
 * rule is there before first paint, where `applyPalette` runs after it.
 */
export function paletteCss(input: PaletteInput, selector = `.${CUSTOM_THEME_CLASS}`): string {
  const body = Object.entries(createPalette(input))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
  return `${selector} {\n${body}\n}\n`
}

/**
 * Re-themes `el` and everything inside it: sets the variables inline and adds
 * `chat-theme-custom`, the class brand.css re-derives its tokens on. Returns a
 * function that puts the element back as it was.
 *
 * Put it on the element that also carries `dark`/`light` — `<html>` for a
 * normal app (portalled menus and dialogs live under `body`), the widget's
 * root for the widget (use the `palette` mount option for that).
 */
export function applyPalette(el: HTMLElement, input: PaletteInput): () => void {
  const vars = createPalette(input)
  const hadClass = el.classList.contains(CUSTOM_THEME_CLASS)
  const before = Object.keys(vars).map((name) => [name, el.style.getPropertyValue(name)] as const)
  for (const [name, value] of Object.entries(vars)) el.style.setProperty(name, value)
  el.classList.add(CUSTOM_THEME_CLASS)
  return () => {
    for (const [name, value] of before) {
      if (value) el.style.setProperty(name, value)
      else el.style.removeProperty(name)
    }
    if (!hadClass) el.classList.remove(CUSTOM_THEME_CLASS)
  }
}

export type ContrastCheck = {
  /** What the pair is, in words. */
  pair: string
  mode: 'light' | 'dark'
  ratio: number
  /** 4.5 for text, 3 for a control or a focus ring (WCAG 2.2 SC 1.4.3 / 1.4.11). */
  min: number
  ok: boolean
}

/**
 * The pairs brand.css leans on hardest, measured. Run it on any palette a
 * tenant supplies and refuse or warn on a failure: `createPalette` keeps the
 * lightness of the shipped ramps, but a fixed `anchor` or an `overrides` entry
 * can move a colour anywhere.
 */
export function checkPalette(input: PaletteInput): ContrastCheck[] {
  const v = createPalette(input)
  const get = (name: string) => v[name as `--${string}`]
  const canvasL = get('--canvas-light')
  const canvasD = get('--canvas-dark')
  const panelD = get('--panel-solid-dark')
  const pairs: [string, 'light' | 'dark', string, string, number][] = [
    ['Body text on the canvas', 'light', get('--ink-light'), canvasL, 4.5],
    ['Secondary text on the canvas', 'light', get('--ink-soft-light'), canvasL, 4.5],
    ['White on a solid brand fill', 'light', '#ffffff', get('--brand-600'), 4.5],
    ['Brand links on the canvas', 'light', get('--brand-500'), canvasL, 4.5],
    ['Accent text on the canvas', 'light', get('--accent-700'), canvasL, 4.5],
    ['Focus ring on the canvas', 'light', get('--accent-600'), canvasL, 3],
    ['Body text on the canvas', 'dark', get('--ink-dark'), canvasD, 4.5],
    ['Secondary text on the panel', 'dark', get('--ink-soft-dark'), panelD, 4.5],
    ['Brand links on the panel', 'dark', get('--brand-300'), panelD, 4.5],
    ['Solid brand fill on the panel', 'dark', get('--brand-50'), panelD, 3],
    ['Glyph on a solid brand fill', 'dark', get('--brand-950'), get('--brand-50'), 4.5],
    ['White on the user bubble', 'dark', '#ffffff', get('--brand-500'), 4.5],
    ['Accent text on the panel', 'dark', get('--accent-300'), panelD, 4.5],
    ['Send button on the panel', 'dark', get('--ember-500'), panelD, 3],
    ['Glyph on the send button', 'dark', '#2b1000', get('--ember-500'), 4.5],
  ]
  return pairs
    .filter(([, , a, b]) => /^#[0-9a-f]{6}$/i.test(a) && /^#[0-9a-f]{6}$/i.test(b))
    .map(([pair, mode, a, b, min]) => {
      const ratio = Math.round(contrastRatio(a, b) * 100) / 100
      return { pair, mode, ratio, min, ok: ratio >= min }
    })
}

/** A custom palette as a PalettePicker tile, next to the shipped ones. The
 *  tile's three colours are read from the palette's own dark values, the same
 *  way the shipped options are. */
export function paletteOption(option: {
  id: string
  label: string
  hint?: string
  palette: PaletteInput
}): PaletteOption {
  const v = createPalette(option.palette)
  return {
    ...option,
    canvas: v['--canvas-dark'],
    panel: v['--panel-solid-dark'],
    action: v['--ember-500'],
  }
}
