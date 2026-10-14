import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { z } from 'zod'

const slugSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/,
    'Use a URL segment containing letters, numbers, hyphens, or underscores',
  )

export const postSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  categories: z.array(z.string().trim().min(1)).default([]),
  slug: slugSchema.optional(),
  image: z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) =>
        /^https:\/\//.test(value) ||
        (!value.includes(':') && !value.startsWith('//')),
      'Use a public image path or HTTPS URL',
    )
    .optional(),
  imageAlt: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`)
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      )
    }, 'Use a valid calendar date'),
  content: z.string(),
})

export function resolvePostSlug(slug: string | undefined, path: string) {
  if (slug !== undefined) return slugSchema.parse(slug)
  return slugSchema.parse(
    path
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  )
}

export function assertUniqueSlugs(
  posts: { slug: string; _meta: { filePath: string } }[],
) {
  const paths = new Map<string, string>()
  for (const post of posts) {
    const previous = paths.get(post.slug)
    if (previous)
      throw new Error(
        `Duplicate post slug "${post.slug}" in ${previous} and ${post._meta.filePath}. Set a unique frontmatter slug.`,
      )
    paths.set(post.slug, post._meta.filePath)
  }
}

export function renderMarkdown(content: string) {
  return sanitizeHtml(marked.parse(content, { async: false }), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  })
}
