import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DocumentPreview } from './document-preview'
import {
  notADocument,
  sampleDocx,
  sampleFiles,
  samplePdf,
  samplePptx,
} from './document-preview.fixtures'

const meta = {
  title: 'Components/DocumentPreview',
  component: DocumentPreview,
  tags: ['autodocs'],
  args: {
    src: samplePdf,
    kind: 'pdf',
    zoom: 1,
    title: 'Sample PDF',
    onLoad: fn(),
    onPageChange: fn(),
    onError: fn(),
  },
  argTypes: {
    src: { control: false },
    zoom: { control: { type: 'range', min: 0.5, max: 3, step: 0.25 } },
  },
  // It scrolls itself, so it needs a parent with a height — here, a box the
  // size of the reference panel.
  decorators: [
    (Story) => (
      <div className="flex h-[34rem] w-[30rem] flex-col overflow-hidden rounded-surface border border-line bg-panel-solid">
        {Story()}
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A PDF, Word or PowerPoint file drawn in place. Give it a file and a kind; it owns fetching, the loading sheet and the failure message, and loads each format’s library only when a document of that kind is first opened. The host owns the controls: `zoom` is a prop, and `onLoad` / `onPageChange` report what a toolbar needs.\n\nThe `Sample…File` stories open the files in `public/docs/` by URL. Replace `sample.pdf`, `sample.docx` or `sample.pptx` there with a real document of the same name to see it drawn.',
      },
    },
  },
} satisfies Meta<typeof DocumentPreview>

export default meta
type Story = StoryObj<typeof meta>

/** Pages fit the box’s width; scroll to see `onPageChange` in the Actions panel. */
export const Pdf: Story = {}

/** A Word file reflows to the box instead of shrinking a fixed page. */
export const Docx: Story = {
  args: { src: sampleDocx, kind: 'docx', title: 'Sample Word document' },
}

/** Slides keep their layout and are fitted to the box, one under the other. */
export const Pptx: Story = {
  args: { src: samplePptx, kind: 'pptx', title: 'Sample presentation' },
}

/** Past 100% a PDF page is wider than the box and scrolls sideways. */
export const Zoomed: Story = { args: { zoom: 1.5 } }

/** A file that won’t open. From a URL it would also offer “Open original”. */
export const CannotPreview: Story = { args: { src: notADocument } }

/** `public/docs/sample.pdf`, fetched by URL. Replace the file to preview your own. */
export const SamplePdfFile: Story = {
  args: { src: sampleFiles.pdf, kind: 'pdf', title: 'sample.pdf' },
}

/** `public/docs/sample.docx`, fetched by URL. Replace the file to preview your own. */
export const SampleDocxFile: Story = {
  args: { src: sampleFiles.docx, kind: 'docx', title: 'sample.docx' },
}

/** `public/docs/sample.pptx`, fetched by URL. Replace the file to preview your own. */
export const SamplePptxFile: Story = {
  args: { src: sampleFiles.pptx, kind: 'pptx', title: 'sample.pptx' },
}

/** A URL with nothing behind it: the failure offers the file itself as well as another try. */
export const MissingFile: Story = {
  args: { src: '/docs/missing.pptx', kind: 'pptx', title: 'missing.pptx' },
}
