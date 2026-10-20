import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArticlePreview } from './article-preview'
import {
  article,
  bareArticle,
  hostileArticle,
  salesforceDetail,
  untypedArticle,
} from './article-preview.fixtures'
import { articleFromSalesforce } from './salesforce'
import type { Article } from './types'

/** The placeholder in `public/docs/`, beside the sample PDF, Word file and deck. */
const SAMPLE_FILE = '/docs/sample.article.json'

const meta = {
  title: 'Components/ArticlePreview',
  component: ArticlePreview,
  tags: ['autodocs', 'experimental'],
  args: { article, zoom: 1, showEmpty: false },
  argTypes: {
    article: { control: false },
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
          '**Experimental.** Drawn from sample data only; the Salesforce mapping is written from documentation and has not been run against a real org. Props, the `Article` shape and the field kinds may change without a deprecation step.\n\nA knowledge article drawn from its fields — the counterpart of DocumentPreview for a source that is a record, not a file. It takes the article as data in the library’s own `Article` shape and fetches nothing; `articleFromSalesforce` maps a Salesforce Knowledge response onto that shape. Rich text is sanitised before it is shown.\n\nThe `SampleArticleFile` story reads `public/docs/sample.article.json`. Replace that file with an article of your own, in the `Article` shape, to see it drawn.',
      },
    },
  },
} satisfies Meta<typeof ArticlePreview>

export default meta
type Story = StoryObj<typeof meta>

/** One field of every kind. Short facts share a grid; a passage or rich text takes the width. */
export const Playground: Story = {}

/** Text scales and the sheet reflows, so there is no sideways scroll to chase. */
export const Zoomed: Story = { args: { zoom: 1.5 } }

/** Unset fields are left out by default; here “Internal notes” shows as a dash. */
export const WithEmptyFields: Story = { args: { showEmpty: true } }

/** No field says what it is, so each value is read for what it holds: HTML, a URL, or text. */
export const UntypedFields: Story = { args: { article: untypedArticle } }

/** An article whose layout shows no fields at all. */
export const TitleOnly: Story = { args: { article: bareArticle } }

/**
 * A Salesforce Knowledge response put through `articleFromSalesforce`. The
 * file field and the repeated title are dropped, and the answer is drawn as
 * rich text although its type is one the mapping has never heard of.
 */
export const FromSalesforce: Story = { args: { article: articleFromSalesforce(salesforceDetail) } }

/**
 * Scripts, handlers, a `javascript:` link, a frame, a form and a full-page
 * overlay were all in this article’s rich text. None of them survive: the
 * overlay is left as an ordinary block of text in its place.
 */
export const Sanitised: Story = { args: { article: hostileArticle } }

/** `public/docs/sample.article.json`, fetched by the story. Replace the file to preview your own. */
export const SampleArticleFile: Story = {
  loaders: [
    async () => {
      const response = await fetch(SAMPLE_FILE)
      if (!response.ok) throw new Error(`${SAMPLE_FILE}: ${response.status}`)
      return { article: (await response.json()) as Article }
    },
  ],
  render: (args, { loaded }) => <ArticlePreview {...args} article={loaded.article} />,
}
