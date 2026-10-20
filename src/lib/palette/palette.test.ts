import { describe, expect, it } from 'vitest'
import { contrastRatio, hexToOklch, oklchToHex } from './color'
import {
  CUSTOM_THEME_CLASS,
  RAMP_STEPS,
  applyPalette,
  buildRamp,
  checkPalette,
  createPalette,
  paletteCss,
  paletteOption,
} from './palette'

// Brand colours from across the wheel, light and dark, vivid and muted.
const SEEDS = [
  '#004c97',
  '#0f766e',
  '#7c3aed',
  '#be123c',
  '#16a34a',
  '#facc15',
  '#2563eb',
  '#111827',
  '#ea580c',
  '#06b6d4',
  '#db2777',
  '#64748b',
]

describe('color', () => {
  it('round-trips hex through OKLCH', () => {
    for (const hex of SEEDS) expect(oklchToHex(hexToOklch(hex))).toBe(hex)
  })

  it('measures WCAG contrast', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
  })
})

describe('buildRamp', () => {
  it('runs light to dark and keeps the seed exactly', () => {
    for (const seed of SEEDS) {
      const ramp = buildRamp(seed)
      const ls = RAMP_STEPS.map((s) => hexToOklch(ramp[s]).l)
      for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1])
      expect(Object.values(ramp)).toContain(seed)
    }
  })

  it('puts the seed on a fixed step when anchored', () => {
    expect(buildRamp('#0f766e', 600)[600]).toBe('#0f766e')
  })

  it('rebuilds the default theme from its own primary blue', () => {
    const ramp = buildRamp('#004c97')
    expect(ramp[600]).toBe('#004c97')
    // Within a couple of units per channel of the hand-tuned brand.css ramp.
    expect(contrastRatio(ramp[500], '#0069aa')).toBeLessThan(1.25)
    expect(contrastRatio(ramp[950], '#001932')).toBeLessThan(1.05)
  })
})

describe('createPalette', () => {
  it('declares every tier-1 variable a theme block does', () => {
    const vars = createPalette({ brand: '#0f766e' })
    for (const s of RAMP_STEPS) expect(vars[`--brand-${s}`]).toMatch(/^#[0-9a-f]{6}$/)
    for (const name of [
      '--accent-200',
      '--accent-700',
      '--ember-500',
      '--canvas-light',
      '--panel-light',
      '--ink-soft-light',
      '--canvas-dark',
      '--panel-solid-dark',
      '--ink-strong-dark',
    ])
      expect(vars[name as `--${string}`]).toBeTruthy()
  })

  it('aliases the accent to the brand when no accent is given', () => {
    const vars = createPalette({ brand: '#7c3aed' })
    expect(vars['--accent-600']).toBe(vars['--brand-600'])
  })

  it('keeps the shipped orange unless a warm seed is given', () => {
    expect(createPalette({ brand: '#7c3aed' })['--ember-500']).toBe('#ef6a00')
    expect(createPalette({ brand: '#7c3aed', warm: '#7c3aed' })['--ember-500']).not.toBe('#ef6a00')
  })

  it('applies fonts and raw overrides last', () => {
    const vars = createPalette({
      brand: '#0f766e',
      font: 'Inter, sans-serif',
      overrides: { notify: '#b91c1c', '--brand-50': '#ffffff' },
    })
    expect(vars['--font-brand-family']).toBe('Inter, sans-serif')
    expect(vars['--notify']).toBe('#b91c1c')
    expect(vars['--brand-50']).toBe('#ffffff')
  })

  it.each(SEEDS)('%s clears every contrast check, tinted and neutral', (brand) => {
    for (const surfaces of ['tinted', 'neutral'] as const) {
      const fails = checkPalette({ brand, surfaces }).filter((c) => !c.ok)
      expect(fails).toEqual([])
    }
  })

  it('reports, rather than hides, a seed pinned where it fails', () => {
    const fails = checkPalette({ brand: '#facc15', anchor: 600 }).filter((c) => !c.ok)
    expect(fails.map((f) => f.pair)).toContain('White on a solid brand fill')
  })
})

describe('applyPalette', () => {
  it('sets the variables and the class, and undoes both', () => {
    const el = document.createElement('div')
    el.style.setProperty('--brand-600', 'red')
    const undo = applyPalette(el, { brand: '#0f766e' })
    expect(el.classList.contains(CUSTOM_THEME_CLASS)).toBe(true)
    expect(el.style.getPropertyValue('--canvas-dark')).toMatch(/^#/)
    undo()
    expect(el.classList.contains(CUSTOM_THEME_CLASS)).toBe(false)
    expect(el.style.getPropertyValue('--canvas-dark')).toBe('')
    expect(el.style.getPropertyValue('--brand-600')).toBe('red')
  })
})

describe('paletteCss and paletteOption', () => {
  it('writes a rule for a stylesheet', () => {
    const css = paletteCss({ brand: '#0f766e' }, ':root')
    expect(css.startsWith(':root {\n')).toBe(true)
    expect(css).toContain('--brand-50: #')
  })

  it('builds a picker tile from the dark values', () => {
    const option = paletteOption({ id: 'teal', label: 'Teal', palette: { brand: '#0f766e' } })
    const vars = createPalette({ brand: '#0f766e' })
    expect(option).toMatchObject({
      id: 'teal',
      canvas: vars['--canvas-dark'],
      panel: vars['--panel-solid-dark'],
      action: vars['--ember-500'],
    })
  })
})
