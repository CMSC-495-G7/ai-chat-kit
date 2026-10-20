import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ChevronRightIcon } from '../icons'
import { Link } from './link'
import { NavigateProvider } from './navigation'

const meta = {
  title: 'Primitives/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '/t/alderfinch-treasury/tasks', children: 'Open Tasks' },
  parameters: {
    docs: {
      description: {
        component:
          'A real anchor that a host can route on the client. Nothing in the library imports a router: a link takes `href`, and a plain left click goes to `onNavigate` — its own, or the one a `NavigateProvider` supplies. Modified clicks are left to the browser, so open-in-new-tab keeps working.',
      },
    },
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    // Stops the story from leaving Storybook when the link is clicked.
    onNavigate: fn((_href: string, event: { preventDefault: () => void }) =>
      event.preventDefault(),
    ),
  },
}

export const WithTrailingIcon: Story = {
  args: {
    className: 'text-[13px]',
    children: (
      <>
        Open Tasks <ChevronRightIcon width={14} height={14} />
      </>
    ),
    onNavigate: fn((_href: string, event: { preventDefault: () => void }) =>
      event.preventDefault(),
    ),
  },
}

/** `plain` adds no classes, for a link that is a whole row. */
export const PlainRow: Story = {
  args: {
    variant: 'plain',
    className:
      'flex h-11 w-64 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium text-ink transition hover:bg-tint/5',
    children: 'A menu row',
    onNavigate: fn((_href: string, event: { preventDefault: () => void }) =>
      event.preventDefault(),
    ),
  },
}

/**
 * One provider at the root is all a routed app needs. Here it stands in for a
 * router: it records the address instead of leaving the page.
 */
export const UnderAProvider: Story = {
  render: function UnderAProviderStory() {
    const [path, setPath] = useState('/t/alderfinch-treasury/home')
    return (
      <NavigateProvider
        value={(href, event) => {
          event.preventDefault()
          setPath(href)
        }}
      >
        <div className="flex flex-col gap-3 text-[13px]">
          <span className="text-ink-soft">
            Current address: <code className="text-ink-strong">{path}</code>
          </span>
          <div className="flex gap-5">
            <Link href="/t/alderfinch-treasury/home">Home</Link>
            <Link href="/t/alderfinch-treasury/tasks">Tasks</Link>
            <Link href="/t/alderfinch-treasury/workflows">Runs</Link>
          </div>
        </div>
      </NavigateProvider>
    )
  },
}
