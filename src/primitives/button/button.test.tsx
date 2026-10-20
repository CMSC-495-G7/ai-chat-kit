import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'
import { buttonClass } from './classes'

describe('Button', () => {
  it('is type="button" unless told otherwise, so it never submits a form by accident', () => {
    render(
      <>
        <Button>Cancel</Button>
        <Button type="submit">Save</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button')
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does nothing while disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('draws both icons around the label and is still named by the label', () => {
    render(
      <Button icon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
        Export
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Export' })
    expect(button).toContainElement(screen.getByTestId('lead'))
    expect(button).toContainElement(screen.getByTestId('trail'))
    expect(screen.getByTestId('lead').compareDocumentPosition(screen.getByTestId('trail'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('passes native attributes and its ref through to the button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <Button ref={ref} aria-expanded={true} name="export">
        Export
      </Button>,
    )
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Export' }))
    expect(ref.current).toHaveAttribute('aria-expanded', 'true')
    expect(ref.current).toHaveAttribute('name', 'export')
  })
})

describe('buttonClass', () => {
  it('defaults to the secondary variant at the medium height', () => {
    const classes = buttonClass({}).split(' ')
    expect(classes).toContain('h-9')
    expect(classes).toContain('bg-panel-solid')
  })

  it('gives each size its own fixed height', () => {
    expect(buttonClass({ size: 'sm' }).split(' ')).toContain('h-8')
    expect(buttonClass({ size: 'lg' }).split(' ')).toContain('h-11')
  })

  it('fills its container only when block, and keeps the caller class last', () => {
    expect(buttonClass({}).split(' ')).not.toContain('w-full')
    const classes = buttonClass({ block: true, className: 'mt-4' }).split(' ')
    expect(classes).toContain('w-full')
    expect(classes.at(-1)).toBe('mt-4')
  })
})
