import { describe, expect, it } from 'vitest'
import { toCsv, toJson, type ExportColumn } from './export'

type Row = { name: string; seats: number; note?: string | null }

const columns: ExportColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'seats', header: 'Seats' },
  { key: 'note', header: 'Note' },
]

describe('toCsv', () => {
  it('writes a header line, then one line per row', () => {
    expect(toCsv([{ name: 'Crestview Bank', seats: 412 }], columns)).toBe(
      'Name,Seats,Note\r\nCrestview Bank,412,',
    )
  })

  it('quotes cells with commas, quotes or line breaks', () => {
    const csv = toCsv([{ name: 'Liberty, Savings', seats: 1, note: 'say "hi"\nthen go' }], columns)
    expect(csv.split('\r\n')[1]).toBe('"Liberty, Savings",1,"say ""hi""\nthen go"')
  })

  it('keeps text that looks like a formula from running, but leaves numbers alone', () => {
    const csv = toCsv([{ name: '=HYPERLINK("x")', seats: -5, note: '@sum' }], columns)
    expect(csv.split('\r\n')[1]).toBe(`"'=HYPERLINK(""x"")",-5,'@sum`)
  })

  it('reads a derived value when a column gives one', () => {
    const csv = toCsv(
      [{ name: 'A', seats: 3 }],
      [{ key: 'label', header: 'Label', value: (r) => `${r.name} (${r.seats})` }],
    )
    expect(csv).toBe('Label\r\nA (3)')
  })
})

describe('toJson', () => {
  it('keys each row by the columns, with null for nothing', () => {
    expect(JSON.parse(toJson([{ name: 'A', seats: 3 }], columns))).toEqual([
      { name: 'A', seats: 3, note: null },
    ])
  })

  it('writes the rows as they are without columns', () => {
    expect(JSON.parse(toJson([{ name: 'A', seats: 3 }]))).toEqual([{ name: 'A', seats: 3 }])
  })
})
