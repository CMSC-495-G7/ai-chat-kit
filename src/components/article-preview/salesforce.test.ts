import { describe, expect, it } from 'vitest'
import { salesforceDetail } from './article-preview.fixtures'
import { articleFromSalesforce } from './salesforce'

describe('articleFromSalesforce', () => {
  const article = articleFromSalesforce(salesforceDetail)
  const field = (name: string) => article.fields.find((item) => item.name === name)

  it('carries the heading over', () => {
    expect(article).toMatchObject({
      title: 'Same-day wire transfers: cut-off times and approvals',
      number: '000001004',
      version: 7,
      publishedAt: '2016-06-21T21:11:02Z',
    })
  })

  it('keeps the layout’s order', () => {
    expect(article.fields.map((item) => item.name)).toEqual([
      'IsOutOfDate',
      'sample',
      'Language',
      'MyNumber',
      'Review_Date__c',
      'Answer__c',
    ])
  })

  it('leaves out file fields, which the API sends no value for', () => {
    expect(field('My_File')).toBeUndefined()
  })

  it('leaves out the title, which already heads the article', () => {
    expect(field('Title')).toBeUndefined()
  })

  it('reads a checkbox as a boolean', () => {
    expect(field('IsOutOfDate')).toMatchObject({ kind: 'boolean', value: 'false' })
  })

  it('reads a date type by whether its value carries a time', () => {
    expect(field('Review_Date__c')?.kind).toBe('date')
    const withTime = articleFromSalesforce({
      title: 'T',
      layoutItems: [
        { type: 'DATE_TIME', name: 'At__c', label: 'At', value: '2026-06-18T14:30:00.000Z' },
      ],
    })
    expect(withTime.fields[0].kind).toBe('dateTime')
  })

  it('gives a type it doesn’t know no kind, so the preview reads the value', () => {
    expect(field('Language')).toEqual({
      name: 'Language',
      label: 'Language',
      value: 'en_US',
      kind: undefined,
    })
    expect(field('Answer__c')?.kind).toBeUndefined()
  })

  it('copes with a response that has no layout items or summary', () => {
    expect(articleFromSalesforce({ title: 'Bare', summary: null })).toEqual({
      title: 'Bare',
      summary: undefined,
      number: undefined,
      version: undefined,
      publishedAt: undefined,
      fields: [],
    })
  })
})
