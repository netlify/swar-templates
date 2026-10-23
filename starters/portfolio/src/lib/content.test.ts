import { describe, expect, it } from 'vitest'
import {
  assertUniqueSlugs,
  blogSchema,
  jobSchema,
  projectSchema,
  renderMarkdown,
  resolveSlug,
} from './content'
import { chronologicalEntries, formatDate, newestPosts } from './chronology'

describe('portfolio content', () => {
  it('renders headings, lists, code, links and images and removes unsafe HTML', () => {
    const html = renderMarkdown(
      '## Heading\n\n- One\n- Two\n\n```ts\nconst value = 1\n```\n\n[Contact](/contact)\n\n![Example](/example.png)\n\n<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">Bad link</a>',
    )
    for (const expected of [
      '<h2>',
      '<ul>',
      '<pre>',
      '<code class="language-ts">',
      'href="/contact"',
      'src="/example.png"',
    ])
      expect(html).toContain(expected)
    expect(html).not.toMatch(/<script|onerror|javascript:/)
  })
  it('keeps existing flat blog URLs and supports nested files and explicit slugs', () => {
    expect(resolveSlug(undefined, 'react-19-features')).toBe(
      'react-19-features',
    )
    expect(resolveSlug(undefined, 'notes/A Long Walk')).toBe(
      'notes-a-long-walk',
    )
    expect(resolveSlug('my_custom-slug', 'renamed-file')).toBe('my_custom-slug')
    expect(() => resolveSlug('../escape', 'file')).toThrow()
  })
  it('rejects colliding blog slugs with both filenames', () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: 'same', _meta: { filePath: 'one.md' } },
        { slug: 'same', _meta: { filePath: 'two.md' } },
      ]),
    ).toThrow('one.md and two.md')
  })
  it.each(['2025-02-30', 'invalid', '01/01/2025'])(
    'rejects invalid date %s',
    (date) => {
      expect(
        blogSchema.safeParse({
          title: 'Example',
          date,
          summary: 'Summary',
          author: 'Jane Doe',
          content: '',
        }).success,
      ).toBe(false)
    },
  )
  it('rejects reversed experience dates and unsafe project URLs', () => {
    expect(
      jobSchema.safeParse({
        jobTitle: 'Role',
        company: 'Example company',
        summary: 'Summary',
        startDate: '2025-01-01',
        endDate: '2024-01-01',
        content: '',
      }).success,
    ).toBe(false)
    const project = {
      title: 'Example',
      description: 'Description',
      content: '',
    }
    expect(projectSchema.parse(project).tags).toEqual([])
    for (const image of [
      'javascript:alert(1)',
      '//example.com/image.png',
      'data:image/svg+xml,x',
      'https://',
    ])
      expect(projectSchema.safeParse({ ...project, image }).success).toBe(false)
    expect(
      projectSchema.safeParse({ ...project, github: 'javascript:alert(1)' })
        .success,
    ).toBe(false)
    expect(
      projectSchema.safeParse({ ...project, github: 'not-a-url' }).success,
    ).toBe(false)
  })
  it('orders current experience first, then recent dates, with stable ties and no mutation', () => {
    const entries = [
      {
        startDate: '2020-01-01',
        endDate: '2021-01-01',
        _meta: { path: 'old' },
      },
      {
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        _meta: { path: 'recent' },
      },
      { startDate: '2022-01-01', _meta: { path: 'z-current' } },
      { startDate: '2022-01-01', _meta: { path: 'a-current' } },
    ]
    expect(
      chronologicalEntries(entries).map((entry) => entry._meta.path),
    ).toEqual(['a-current', 'z-current', 'recent', 'old'])
    expect(entries[0]._meta.path).toBe('old')
    expect(chronologicalEntries([])).toEqual([])
  })
  it('sorts posts newest first with stable ties and formats UTC dates', () => {
    const posts = [
      { date: '2024-01-01', slug: 'old' },
      { date: '2025-01-01', slug: 'z' },
      { date: '2025-01-01', slug: 'a' },
    ]
    expect(newestPosts(posts).map((post) => post.slug)).toEqual([
      'a',
      'z',
      'old',
    ])
    expect(posts[0].slug).toBe('old')
    expect(formatDate('2025-01-01')).toBe('January 1, 2025')
  })
})
