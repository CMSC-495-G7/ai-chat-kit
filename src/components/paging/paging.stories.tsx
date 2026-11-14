import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from '../pagination'
import { Tabs, TabsList, TabsTrigger } from '../../primitives/tabs'
import { djangoPageAdapter, formatSort, plainPageAdapter, springPageAdapter } from './adapters'
import type { Page } from './types'

const TOTAL = 1284
type Backend = 'django' | 'spring' | 'plain'

/** The same page, as each backend would put it on the wire. */
function envelope(backend: Backend, page: number, size: number) {
  const totalPages = Math.max(1, Math.ceil(TOTAL / size))
  const elements = Math.min(size, Math.max(0, TOTAL - (page - 1) * size))
  const sort = [{ field: 'name', direction: 'asc' }]
  switch (backend) {
    case 'django':
      return {
        success: true,
        data: {
          content: [],
          first: page <= 1,
          last: page >= totalPages,
          page: { elements, number: page - 1, offset: (page - 1) * size + 1, size },
          total: { elements: TOTAL, pages: totalPages },
          sort,
        },
        status: 200,
      }
    case 'spring':
      return {
        content: [],
        number: page - 1,
        size,
        numberOfElements: elements,
        totalElements: TOTAL,
        totalPages,
        first: page <= 1,
        last: page >= totalPages,
        sort: [{ property: 'name', direction: 'ASC' }],
      }
    case 'plain':
      return { items: [], page, limit: size, total: TOTAL, sort: 'name,asc' }
  }
}

const ADAPTERS = { django: djangoPageAdapter, spring: springPageAdapter, plain: plainPageAdapter }

function pick(p: Page<unknown>) {
  const { content: _content, ...rest } = p
  return rest
}

function AdapterExplorer({
  initialBackend = 'django',
  initialPage = 5,
}: {
  initialBackend?: Backend
  initialPage?: number
}) {
  const [backend, setBackend] = useState<Backend>(initialBackend)
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(10)
  const wire = useMemo(() => envelope(backend, page, size), [backend, page, size])
  const normalized = useMemo(() => ADAPTERS[backend]<unknown>(wire), [backend, wire])
  const pre =
    'overflow-x-auto rounded-control bg-code-block p-3 text-[12px] leading-relaxed text-ink'
  const label = 'text-[11px] font-extrabold tracking-[0.07em] text-ink-soft uppercase'
  return (
    <div className="flex flex-col gap-4">
      <Tabs value={backend} onValueChange={(v) => v && setBackend(v as Backend)}>
        <TabsList variant="segmented">
          <TabsTrigger value="django">Django</TabsTrigger>
          <TabsTrigger value="spring">Spring</TabsTrigger>
          <TabsTrigger value="plain">Plain / Node</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="overflow-hidden rounded-control border border-line">
        <Pagination
          page={normalized.page}
          size={normalized.size}
          totalElements={normalized.totalElements}
          totalPages={normalized.totalPages}
          offset={normalized.offset}
          elements={normalized.elements}
          onPageChange={setPage}
          onSizeChange={(n) => {
            setSize(n)
            setPage(1)
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <div className="flex flex-col gap-2">
          <span className={label}>Wire — {backend}</span>
          <pre className={pre}>{JSON.stringify(wire, null, 2)}</pre>
        </div>
        <div className="flex flex-col gap-2">
          <span className={label}>Normalised — Page</span>
          <pre className={pre}>{JSON.stringify(pick(normalized), null, 2)}</pre>
          <span className="text-[12.5px] text-ink">
            <code className="rounded bg-code px-1.5 py-0.5">
              sort={formatSort(normalized.sort)}
            </code>
          </span>
        </div>
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Paging model',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Page through and switch backends: three wire shapes, one `Page`. No
 * component ever writes `page - 1` — the adapter is the only place that
 * conversion lives.
 */
export const AdapterExplorerStory: Story = {
  name: 'Adapter explorer',
  render: () => <AdapterExplorer />,
}

/** A backend that counts pages from zero. The adapter adds the one; nothing else does. */
export const ZeroBasedBackend: Story = {
  name: 'Zero-based backend',
  render: () => <AdapterExplorer initialBackend="spring" />,
}

/** A backend with no envelope at all, on its last page, where `last` has to be worked out. */
export const LastPage: Story = {
  name: 'Last page of a plain backend',
  render: () => <AdapterExplorer initialBackend="plain" initialPage={129} />,
}
