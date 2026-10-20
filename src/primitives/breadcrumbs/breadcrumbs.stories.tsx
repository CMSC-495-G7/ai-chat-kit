import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumbs,
} from './breadcrumbs'

const meta = {
  title: 'Primitives/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A semantic, compact location trail — `nav > ol > li`. Page actions are composed beside it, never inside it.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

const stop = (e: React.MouseEvent) => e.preventDefault()

export const Trail: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="font-bold text-brand-fg" onClick={stop}>
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#" onClick={stop}>
            Tenants
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#" onClick={stop}>
            Northeast portfolio
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Crestview Health</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumbs>
  ),
}

export const WithPageAction: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Breadcrumbs {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={stop}>
              Tenants
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Crestview Health</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumbs>
      <Button variant="primary">Add new tenant</Button>
    </div>
  ),
}

/** The shortest useful trail: where you came from, and where you are. */
export const TwoLevels: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" onClick={stop}>
            Workflows
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Commercial loan review</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumbs>
  ),
}

/** In a narrow column the trail wraps rather than pushing the page wider. */
export const WrappingInANarrowColumn: Story = {
  render: (args) => (
    <div className="w-64 rounded-control border border-dashed border-line p-3">
      <Breadcrumbs {...args}>
        <BreadcrumbList>
          {['Dashboard', 'Tenants', 'Northeast portfolio', 'Harbor Street Credit Union'].map(
            (label) => (
              <span key={label} className="contents">
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" onClick={stop}>
                    {label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </span>
            ),
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>Access and roles</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumbs>
    </div>
  ),
}
