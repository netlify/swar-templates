import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { z } from 'zod'

const text = z.string().trim().min(1)
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    )
  }, 'Use a valid YYYY-MM-DD calendar date')
const slug = text.regex(/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/)
const tags = z.array(text).default([])
const url = z.url({ protocol: /^https?$/ })
const datedFields = {
  summary: text,
  startDate: date,
  endDate: date.optional(),
  tags,
  content: z.string(),
}
const validRange = (entry: { startDate: string; endDate?: string }) =>
  !entry.endDate || entry.endDate >= entry.startDate

export const jobSchema = z
  .object({
    ...datedFields,
    jobTitle: text,
    company: text,
    location: text.optional(),
  })
  .refine(validRange, 'End date must not precede start date')
export const educationSchema = z
  .object({ ...datedFields, school: text })
  .refine(validRange, 'End date must not precede start date')
export const blogSchema = z.object({
  title: text,
  date,
  summary: text,
  tags,
  author: text,
  slug: slug.optional(),
  content: z.string(),
})
export const projectSchema = z.object({
  title: text,
  description: text,
  tags,
  github: url.optional(),
  liveUrl: url.optional(),
  image: z
    .union([
      z.url({ protocol: /^https$/ }),
      text.refine(
        (value) =>
          !value.includes(':') &&
          !value.startsWith('//') &&
          !value.includes('\\'),
        'Use a public image path or HTTPS URL',
      ),
    ])
    .optional(),
  imageAlt: text.optional(),
  content: z.string(),
})

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

export function resolveSlug(value: string | undefined, path: string) {
  return slug.parse(
    value ??
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
        `Duplicate blog slug "${post.slug}" in ${previous} and ${post._meta.filePath}. Set a unique frontmatter slug.`,
      )
    paths.set(post.slug, post._meta.filePath)
  }
}
