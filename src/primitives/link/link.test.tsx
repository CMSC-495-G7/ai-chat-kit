import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Link } from './link'
import { NavigateProvider } from './navigation'
import type { NavigateHandler } from './types'

// The handlers prevent the default the way a router would, so jsdom is never
// asked to load a page.
const handler = () => vi.fn<NavigateHandler>((_href, event) => event.preventDefault())

describe('Link', () => {
  it('is a real anchor with its address', () => {
    render(<Link href="/tenants">Tenants</Link>)
    expect(screen.getByRole('link', { name: 'Tenants' })).toHaveAttribute('href', '/tenants')
  })

  it('hands a plain left click to onNavigate, with the address', () => {
    const onNavigate = handler()
    render(
      <Link href="/tenants" onNavigate={onNavigate}>
        Tenants
      </Link>,
    )
    fireEvent.click(screen.getByRole('link'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate.mock.calls[0][0]).toBe('/tenants')
  })

  it.each([
    ['⌘', { metaKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['the middle button', { button: 1 }],
  ])('leaves a click with %s to the browser', (_name, init) => {
    const onNavigate = handler()
    // A fragment, so the click jsdom is left to follow goes nowhere.
    render(
      <Link href="#tenants" onNavigate={onNavigate}>
        Tenants
      </Link>,
    )
    fireEvent.click(screen.getByRole('link'), init)
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('uses the handler from NavigateProvider', () => {
    const fromProvider = handler()
    render(
      <NavigateProvider value={fromProvider}>
        <Link href="/runs">Runs</Link>
      </NavigateProvider>,
    )
    fireEvent.click(screen.getByRole('link'))
    expect(fromProvider.mock.calls[0][0]).toBe('/runs')
  })

  it("prefers its own onNavigate over the provider's", () => {
    const fromProvider = handler()
    const own = handler()
    render(
      <NavigateProvider value={fromProvider}>
        <Link href="/runs" onNavigate={own}>
          Runs
        </Link>
      </NavigateProvider>,
    )
    fireEvent.click(screen.getByRole('link'))
    expect(own).toHaveBeenCalledTimes(1)
    expect(fromProvider).not.toHaveBeenCalled()
  })

  it('does not navigate when onClick has already prevented the default', () => {
    const onNavigate = handler()
    render(
      <Link href="/runs" onNavigate={onNavigate} onClick={(event) => event.preventDefault()}>
        Runs
      </Link>,
    )
    fireEvent.click(screen.getByRole('link'))
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('adds no classes of its own as a plain link', () => {
    render(
      <Link href="/runs" variant="plain">
        Runs
      </Link>,
    )
    expect(screen.getByRole('link')).not.toHaveAttribute('class')
  })
})
