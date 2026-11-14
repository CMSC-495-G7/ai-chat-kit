import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './pagination'
import type { PaginationProps } from './types'

// 1,284 rows, ten to a page: 129 pages, the last one holding four.
function setup(props: Partial<PaginationProps> = {}) {
  const onPageChange = vi.fn()
  render(
    <Pagination
      page={5}
      size={10}
      totalElements={1284}
      totalPages={129}
      onPageChange={onPageChange}
      {...props}
    />,
  )
  return { onPageChange, nav: screen.getByRole('navigation', { name: 'Pagination' }) }
}

// The readout uses the runtime's locale for its separators, so the tests do too.
const n = (value: number) => value.toLocaleString()

describe('Pagination', () => {
  it('says which rows are on the page, out of how many', () => {
    const { nav } = setup()
    expect(nav).toHaveTextContent(`41–50 of ${n(1284)}`)
  })

  it('counts a short last page honestly', () => {
    const { nav } = setup({ page: 129 })
    expect(nav).toHaveTextContent(`${n(1281)}–${n(1284)} of ${n(1284)}`)
  })

  it('takes the range from the host when it is given', () => {
    const { nav } = setup({ offset: 101, elements: 7 })
    expect(nav).toHaveTextContent(`101–107 of ${n(1284)}`)
  })

  it('says nothing about the range when there are no rows', () => {
    const { nav } = setup({ page: 1, totalElements: 0, totalPages: 0 })
    expect(nav).not.toHaveTextContent('of 0')
  })

  it('marks the current page and no other', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 4' })).not.toHaveAttribute('aria-current')
  })

  it('asks for the page that was pressed, and for the ones either side', async () => {
    const { onPageChange } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Page 6' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange.mock.calls).toEqual([[6], [4], [6]])
  })

  it('stops at the first page', () => {
    setup({ page: 1 })
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('stops at the last page', () => {
    setup({ page: 129 })
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('drops the numbered rail when compact, keeping the readout and both buttons', () => {
    const { nav } = setup({ compact: true })
    expect(screen.queryByRole('button', { name: /^Page / })).not.toBeInTheDocument()
    expect(within(nav).getAllByRole('button')).toHaveLength(2)
    expect(nav).toHaveTextContent('41–50')
  })

  it('offers rows per page only when the host can act on it', () => {
    setup()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('reports a new page size as a number', async () => {
    const onSizeChange = vi.fn()
    setup({ onSizeChange })
    const rows = screen.getByRole('combobox', { name: 'Rows' })
    expect(rows).toHaveTextContent('10')
    await userEvent.click(rows)
    await userEvent.click(screen.getByRole('option', { name: '50' }))
    expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(50)
  })

  it('uses the host labels', () => {
    setup({
      labels: { previous: 'Zurück', next: 'Weiter', page: (p) => `Seite ${p}` },
    })
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seite 5' })).toBeInTheDocument()
  })
})
