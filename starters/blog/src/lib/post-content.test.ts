import { describe, expect, it } from 'vitest'
import {
  assertUniqueSlugs,
  postSchema,
  renderMarkdown,
  resolvePostSlug,
} from './post-content'
import { findPost, formatDate, getCategories, newestPosts } from './blog'
import { isNotFound } from '@tanstack/react-router'

const post = {
  title: 'Example post',
  summary: 'An example summary.',
  date: '2025-03-01',
  content: '# Hello',
}

describe('blog content', () => {
  it('preserves explicit slugs regardless of title or filename', () => {
    expect(resolvePostSlug('My_custom-url', 'renamed-file')).toBe(
      'My_custom-url',
    )
  })
  it('uses the relative filename for stable fallback URLs', () => {
    expect(resolvePostSlug(undefined, 'notes/A Long Walk')).toBe(
      'notes-a-long-walk',
    )
    expect(resolvePostSlug(undefined, 'café')).toBe('cafe')
  })
  it.each(['', '../escape', 'a/b', 'spaces here', 'javascript:alert(1)'])(
    'rejects invalid slug %j',
    (slug) => {
      expect(() => resolvePostSlug(slug, 'file')).toThrow()
    },
  )
  it('rejects duplicate explicit or derived slugs and names both files', () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: resolvePostSlug('a-b', 'one'), _meta: { filePath: 'one.md' } },
        {
          slug: resolvePostSlug(undefined, 'a b'),
          _meta: { filePath: 'a b.md' },
        },
      ]),
    ).toThrow('Duplicate post slug "a-b" in one.md and a b.md')
  })
  it('accepts omitted categories and images', () => {
    expect(postSchema.parse(post)).toMatchObject({ categories: [] })
  })
  it.each(['2025-02-30', '03/01/2025', 'invalid'])(
    'rejects invalid date %j',
    (date) => {
      expect(postSchema.safeParse({ ...post, date }).success).toBe(false)
    },
  )
  it('accepts leap days and formats dates without timezone shifts', () => {
    expect(postSchema.safeParse({ ...post, date: '2024-02-29' }).success).toBe(
      true,
    )
    expect(formatDate('2025-03-01')).toBe('March 1, 2025')
  })
  it('renders Markdown headings, lists, quotes, code, links, and images', () => {
    const html = renderMarkdown(
      '## Heading\n\n- One\n- Two\n\n> Quote\n\n```ts\nconst x = 1\n```\n\n[Home](/)\n\n![Example](/placeholder.png)',
    )
    for (const tag of [
      '<h2>',
      '<ul>',
      '<blockquote>',
      '<pre>',
      '<code class="language-ts">',
      'href="/"',
      'src="/placeholder.png"',
    ])
      expect(html).toContain(tag)
  })
  it('removes scripts, event handlers, and unsafe URL schemes', () => {
    const html = renderMarkdown(
      '<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
    )
    expect(html).not.toMatch(/script|onerror|javascript:/)
    expect(html).toContain('bad</a>')
  })
  it('sorts newest first without mutating source data and gives ties a stable order', () => {
    const posts = [
      { slug: 'old', date: '2024-01-01', categories: ['Notes'] },
      { slug: 'z', date: '2025-01-01', categories: ['Travel', 'Notes'] },
      { slug: 'a', date: '2025-01-01', categories: [] },
    ]
    expect(newestPosts(posts).map((post) => post.slug)).toEqual([
      'a',
      'z',
      'old',
    ])
    expect(posts[0]?.slug).toBe('old')
    expect(getCategories(posts)).toEqual(['Notes', 'Travel'])
    expect(newestPosts([])).toEqual([])
  })
  it('returns an existing post and throws a router not-found result for a missing one', () => {
    const posts = [{ slug: 'exists', date: '2025-01-01', categories: [] }]
    expect(findPost(posts, 'exists')).toBe(posts[0])
    try {
      findPost(posts, 'missing')
      expect.fail('Expected a not-found result')
    } catch (error) {
      expect(isNotFound(error)).toBe(true)
    }
  })
})
