import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './switch'

describe('Switch', () => {
  it('is a switch named by its label, reporting on or off', () => {
    const { rerender } = render(<Switch label="Web search" checked={false} onChange={() => {}} />)
    const toggle = screen.getByRole('switch', { name: 'Web search' })
    expect(toggle).not.toBeChecked()
    rerender(<Switch label="Web search" checked onChange={() => {}} />)
    expect(toggle).toBeChecked()
  })

  it('asks for the opposite value and does not flip on its own', async () => {
    const onChange = vi.fn()
    render(<Switch label="Web search" checked={false} onChange={onChange} />)
    const toggle = screen.getByRole('switch')
    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
    // Controlled: the parent did not change `checked`, so nothing moved.
    expect(toggle).not.toBeChecked()
  })

  it('flips with Space and with Enter', async () => {
    function Host() {
      const [on, setOn] = useState(false)
      return <Switch label="Web search" checked={on} onChange={setOn} />
    }
    render(<Host />)
    const toggle = screen.getByRole('switch')
    toggle.focus()
    await userEvent.keyboard(' ')
    expect(toggle).toBeChecked()
    await userEvent.keyboard('{Enter}')
    expect(toggle).not.toBeChecked()
  })

  it('does not respond while disabled', async () => {
    const onChange = vi.fn()
    render(<Switch label="Web search" checked={false} onChange={onChange} disabled />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the description under the label', () => {
    render(
      <Switch
        label="Web search"
        description="Answers may cite public pages."
        checked
        onChange={() => {}}
      />,
    )
    expect(screen.getByText('Answers may cite public pages.')).toBeInTheDocument()
  })

  it('keeps its name when the label is hidden, and drops the description', () => {
    render(
      <Switch
        label="Web search"
        description="Answers may cite public pages."
        hideLabel
        checked
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('switch', { name: 'Web search' })).toBeInTheDocument()
    expect(screen.queryByText('Answers may cite public pages.')).not.toBeInTheDocument()
  })
})
