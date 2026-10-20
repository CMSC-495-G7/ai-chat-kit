import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArticlePreview } from './article-preview'
import { article, hostileArticle, untypedArticle } from './article-preview.fixtures'
import type { Article } from './types'

/** The value drawn beside a label in the facts grid. */
const fact = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling!

const one = (field: Article['fields'][number]): Article => ({ title: 'T', fields: [field] })

describe('ArticlePreview', () => {
  it('is a group named for the article, holding one article', () => {
    render(<ArticlePreview article={article} />)
    const group = screen.getByRole('group', { name: `Article: ${article.title}` })
    expect(within(group).getByRole('article')).toBeInTheDocument()
    expect(within(group).getByRole('heading', { level: 2, name: article.title })).toBeVisible()
  })

  it('heads the article with what is known about it', () => {
    render(<ArticlePreview article={article} formatDate={(value) => value.slice(0, 10)} />)
    expect(screen.getByText('Article 000001004 · Version 7 · Published 2026-06-21')).toBeVisible()
    expect(screen.getByText('How-to')).toBeVisible()
  })

  it('draws each kind of field as what it is', () => {
    render(<ArticlePreview article={article} formatDate={(value, kind) => `${kind}:${value}`} />)
    expect(fact('Validated')).toHaveTextContent('Yes')
    expect(fact('Next review')).toHaveTextContent('date:2026-12-01')
    expect(fact('Last verified')).toHaveTextContent('dateTime:2026-06-18T14:30:00Z')
    expect(within(fact('Policy') as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      'https://library.example.com/policies/wires',
    )
  })

  it('gives a passage and rich text the full width, under a heading', () => {
    render(<ArticlePreview article={article} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Question' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Answer' })).toBeVisible()
    expect(screen.getByRole('table')).toBeVisible()
    expect(screen.getByRole('img', { name: /initiator to an approver/ })).toBeVisible()
  })

  it('leaves an unset field out, unless asked to show it', () => {
    const { rerender } = render(<ArticlePreview article={article} />)
    expect(screen.queryByText('Internal notes')).toBeNull()
    rerender(<ArticlePreview article={article} showEmpty />)
    expect(fact('Internal notes')).toHaveTextContent('—')
  })

  it('reads a value for what it is when its kind is missing', () => {
    render(<ArticlePreview article={untypedArticle} />)
    // HTML is drawn, not printed.
    expect(screen.getByRole('table')).toBeVisible()
    expect(screen.queryByText(/<p>/)).toBeNull()
    // A lone URL is a link; a boolean nobody declared stays the text it is.
    expect(within(fact('Policy') as HTMLElement).getByRole('link')).toBeVisible()
    expect(fact('Validated')).toHaveTextContent('true')
  })

  it('draws a kind it has never heard of as text', () => {
    render(
      <ArticlePreview
        article={one({ name: 'f', label: 'Rating', kind: 'stars' as never, value: '4 of 5' })}
      />,
    )
    expect(fact('Rating')).toHaveTextContent('4 of 5')
  })

  it('shows a link field with an unsafe address as text, not a link', () => {
    render(<ArticlePreview article={hostileArticle} />)
    expect(fact('Link field')).toHaveTextContent('javascript:alert(1)')
    expect(within(fact('Link field') as HTMLElement).queryByRole('link')).toBeNull()
  })

  it('sanitises rich text', () => {
    const { container } = render(<ArticlePreview article={hostileArticle} />)
    expect(container.querySelectorAll('script, style, iframe, form, input, button')).toHaveLength(0)
    expect(screen.getByText('A link that ran script')).not.toHaveAttribute('href')
    expect(screen.getByText('This paragraph is fine.')).toBeVisible()
  })

  it('keeps line breaks in plain text', () => {
    render(
      <ArticlePreview
        article={one({ name: 'f', label: 'Steps', kind: 'text', value: 'First\nSecond' })}
      />,
    )
    expect(screen.getByText(/First/)).toHaveClass('whitespace-pre-line')
  })

  it('takes its words from labels', () => {
    render(
      <ArticlePreview
        article={article}
        labels={{ region: (title) => `Artículo: ${title}`, yes: 'Sí' }}
      />,
    )
    expect(screen.getByRole('group', { name: `Artículo: ${article.title}` })).toBeVisible()
    expect(fact('Validated')).toHaveTextContent('Sí')
  })
})
