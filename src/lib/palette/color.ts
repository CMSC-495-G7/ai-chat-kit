/**
 * The colour maths the palette builder needs, and nothing more: hex in and
 * out, OKLCH for building ramps, and the WCAG contrast ratio for checking
 * them. OKLCH because its lightness is perceptual — two steps at the same L
 * look equally light whatever the hue — which is what lets one lightness table
 * serve every brand colour.
 */

export type Oklch = { l: number; c: number; h: number }
type Rgb = [number, number, number]

/** `#rgb`, `#rrggbb` (with or without `#`) → 0–1 sRGB channels. */
export function parseHex(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = [...h].map((ch) => ch + ch).join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a hex colour: "${hex}"`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb
}

export function toHex([r, g, b]: Rgb): string {
  const byte = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${byte(r)}${byte(g)}${byte(b)}`
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toGamma = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)

// Björn Ottosson's OKLab matrices, sRGB-linear in and out.
function linearToOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function hexToOklch(hex: string): Oklch {
  const [L, a, b] = linearToOklab(parseHex(hex).map(toLinear) as Rgb)
  const c = Math.hypot(a, b)
  const h = c < 1e-4 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/**
 * OKLCH → hex. A colour outside sRGB keeps its lightness and hue and gives up
 * chroma until it fits, so a step never comes back lighter or darker than the
 * table asked for — which is what the contrast checks depend on.
 */
export function oklchToHex({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180
  const at = (chroma: number) => oklabToLinear([l, chroma * Math.cos(rad), chroma * Math.sin(rad)])
  let rgb = at(c)
  if (!inGamut(rgb)) {
    let lo = 0
    let hi = c
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(at(mid))) lo = mid
      else hi = mid
    }
    rgb = at(lo)
  }
  return toHex(rgb.map(toGamma) as Rgb)
}

/** WCAG 2.x relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio, 1–21. Order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** `#rrggbb` + alpha → `rgba(…)`, for the translucent glass panels. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex).map((v) => Math.round(v * 255))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
