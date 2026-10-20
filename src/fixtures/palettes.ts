import { paletteOption } from '../lib/palette/palette'
import { SHIPPED_PALETTES, type PaletteOption } from '../lib/settings/appearance'

/** Custom palettes, built at runtime from seed colours, for the stories and
 *  the demo settings to offer beside the shipped `chat-theme-*` classes. */
export const SAMPLE_CUSTOM_PALETTES: PaletteOption[] = [
  paletteOption({
    id: 'teal',
    label: 'Teal',
    hint: 'Built at runtime from one seed colour, #0f766e. The send button keeps the shipped orange.',
    palette: { brand: '#0f766e' },
  }),
  paletteOption({
    id: 'plum',
    label: 'Plum',
    hint: 'One hue everywhere: #7c3aed is the brand and the warm note, so there is no orange at all.',
    palette: { brand: '#7c3aed', warm: '#7c3aed', surfaces: 'neutral' },
  }),
  // Three seeds: a deep red brand, a gold warm note and a blue accent. The red
  // lands on the 600 step as-is, so solid fills are exactly #a30606. The gold
  // is pinned to the 500 step, which the dark send button uses, because the
  // ramp would otherwise darken it to mustard; checkPalette passes every pair
  // either way.
  paletteOption({
    id: 'crimson',
    label: 'Crimson',
    hint: 'Deep red with a gold send button, blue links and charcoal surfaces.',
    palette: {
      brand: '#a30606',
      accent: '#0e578c',
      warm: '#fdbf38',
      surfaces: 'neutral',
      overrides: { '--ember-500': '#fdbf38' },
    },
  }),
]

export const DEMO_PALETTES: PaletteOption[] = [...SHIPPED_PALETTES, ...SAMPLE_CUSTOM_PALETTES]
