import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import type { TabsProps } from './types'

function Example(props: Omit<TabsProps, 'children'>) {
  return (
    <Tabs {...props}>
      <TabsList aria-label="Tenant">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="usage">Usage panel</TabsContent>
      <TabsContent value="billing">Billing panel</TabsContent>
      <TabsContent value="audit">Audit panel</TabsContent>
    </Tabs>
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })

describe('Tabs', () => {
  it('shows only the selected panel and ties it to its tab', () => {
    render(<Example defaultValue="usage" />)
    expect(tab('Usage')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'false')

    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('Usage panel')
    expect(panel).toHaveAccessibleName('Usage')
    expect(tab('Usage')).toHaveAttribute('aria-controls', panel.id)
  })

  it('selects on click and reports the value', async () => {
    const onValueChange = vi.fn()
    render(<Example defaultValue="overview" onValueChange={onValueChange} />)
    await userEvent.click(tab('Audit'))
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('audit')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Audit panel')
  })

  it('stays where the parent says when controlled', async () => {
    const onValueChange = vi.fn()
    render(<Example value="overview" onValueChange={onValueChange} />)
    await userEvent.click(tab('Usage'))
    expect(onValueChange).toHaveBeenCalledWith('usage')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview panel')
  })

  it('keeps one tab in the Tab order: the selected one', () => {
    render(<Example defaultValue="usage" />)
    expect(tab('Usage')).toHaveAttribute('tabindex', '0')
    expect(tab('Overview')).toHaveAttribute('tabindex', '-1')
    expect(tab('Audit')).toHaveAttribute('tabindex', '-1')
  })

  it('makes the first tab reachable when nothing is selected', () => {
    render(<Example />)
    expect(tab('Overview')).toHaveAttribute('tabindex', '0')
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })

  it('moves with the arrow keys, wrapping and skipping a disabled tab', async () => {
    render(<Example defaultValue="usage" />)
    tab('Usage').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(tab('Audit')).toHaveFocus()
    expect(tab('Audit')).toHaveAttribute('aria-selected', 'true')

    await userEvent.keyboard('{ArrowRight}')
    expect(tab('Overview')).toHaveFocus()

    await userEvent.keyboard('{End}')
    expect(tab('Audit')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(tab('Overview')).toHaveFocus()
  })

  it('waits for a press before selecting in manual mode', async () => {
    render(<Example defaultValue="overview" activationMode="manual" />)
    tab('Overview').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(tab('Usage')).toHaveFocus()
    expect(tab('Usage')).toHaveAttribute('aria-selected', 'false')

    await userEvent.keyboard('{Enter}')
    expect(tab('Usage')).toHaveAttribute('aria-selected', 'true')
  })

  it('uses the up and down arrows when vertical', async () => {
    render(<Example defaultValue="overview" orientation="vertical" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    tab('Overview').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(tab('Overview')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(tab('Usage')).toHaveFocus()
  })

  it('clears the selection on a second press when allowDeselect is set', async () => {
    const onValueChange = vi.fn()
    render(
      <Example
        defaultValue="usage"
        allowDeselect
        activationMode="manual"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(tab('Usage'))
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null)
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })

  it('refuses a part used outside Tabs', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TabsTrigger value="a">A</TabsTrigger>)).toThrow(
      'TabsTrigger must be used inside Tabs',
    )
  })
})
