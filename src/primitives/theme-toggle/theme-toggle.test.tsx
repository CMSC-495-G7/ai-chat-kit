import { render, screen, fireEvent } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ThemeToggle } from './theme-toggle'

it('lets a controlled host own scope and persistence without changing the page', () => {
  const before = document.documentElement.className
  const storage = vi.spyOn(Storage.prototype, 'setItem')
  const onDarkChange = vi.fn()
  const { rerender } = render(
    <ThemeToggle
      dark={false}
      onDarkChange={onDarkChange}
      storageKey={null}
      applyToDocument={false}
      darkLabel="Use night colors"
      lightLabel="Use day colors"
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Use night colors' }))
  expect(onDarkChange).toHaveBeenCalledWith(true)
  expect(screen.getByRole('button', { name: 'Use night colors' })).toBeVisible()
  rerender(
    <ThemeToggle
      dark
      onDarkChange={onDarkChange}
      storageKey={null}
      applyToDocument={false}
      darkLabel="Use night colors"
      lightLabel="Use day colors"
    />,
  )
  expect(screen.getByRole('button', { name: 'Use day colors' })).toBeVisible()
  expect(storage).not.toHaveBeenCalled()
  expect(document.documentElement.className).toBe(before)
})
